// Procedural Audio Engine for Cinematic Soundscapes
class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private vinylSource: AudioBufferSourceNode | null = null;
  private padSynth: {
    oscs: OscillatorNode[];
    gain: GainNode;
    filter: BiquadFilterNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null = null;
  private heartbeatInterval: any = null;

  private isRunning: boolean = false;
  private currentInstrument: string = "warm-pad";
  private currentBpm: number = 70;
  private currentHasRain: boolean = true;

  constructor() {
    // Initial structures
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.primaryGain.connect(this.ctx.destination);

      // Create generators
      this.setupRainGenerator();
      this.setupVinylCrackle();
      this.setupSynthPad();
      this.startHeartbeatLoop();
    } catch (err) {
      console.error("Audio Context initialization failed:", err);
    }
  }

  public start() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isRunning = true;
    this.applyCurrentSettings();
  }

  public stop() {
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend();
    }
    this.isRunning = false;
  }

  public updateSettings(instrument: string, bpm: number, hasRain: boolean) {
    this.currentInstrument = instrument;
    this.currentBpm = bpm;
    this.currentHasRain = hasRain;
    if (this.isRunning) {
      this.applyCurrentSettings();
    }
  }

  private applyCurrentSettings() {
    if (!this.ctx) return;

    // 1. Weather Rain Engine
    if (this.rainGain) {
      const targetRainVal = this.currentHasRain ? 0.25 : 0.0;
      this.rainGain.gain.setTargetAtTime(targetRainVal, this.ctx.currentTime, 1.5);
    }

    // 2. Instrument Synthesizer Adjustments
    if (this.padSynth) {
      const targetPadVal = 0.35;
      this.padSynth.gain.gain.setTargetAtTime(targetPadVal, this.ctx.currentTime, 1.0);

      // Adjust synth filter and frequency structure based on choices
      const isSaw = this.currentInstrument.includes("saw");
      const isLowSub = this.currentInstrument.includes("sub") || this.currentInstrument.includes("bass");
      const isRhodes = this.currentInstrument.includes("rhodes") || this.currentInstrument.includes("crackle");

      const baseFreqs = isLowSub 
        ? [48, 55, 60] // deep sub octaves (C2, G2, C3)
        : isSaw 
          ? [57, 60, 64, 67] // sharp saw minor chords (A3, C4, E4, G4)
          : [60, 63, 67, 70]; // warm pad classical minor seventh (C4, Eb4, G4, Bb4)

      this.padSynth.oscs.forEach((osc, idx) => {
        const midiNote = baseFreqs[idx % baseFreqs.length] - (isLowSub ? 12 : 0);
        const freq = this.midiToFreq(midiNote);
        osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 1.0);
        
        // Dynamic oscillator shape
        osc.type = isLowSub 
          ? "triangle" 
          : isSaw 
            ? "sawtooth" 
            : isRhodes 
              ? "sine" 
              : "triangle";
      });

      // Adjust synthesizer filtering
      if (isLowSub) {
        this.padSynth.filter.frequency.setTargetAtTime(150, this.ctx.currentTime, 0.5);
      } else if (isSaw) {
        this.padSynth.filter.frequency.setTargetAtTime(650, this.ctx.currentTime, 0.5);
      } else {
        this.padSynth.filter.frequency.setTargetAtTime(320, this.ctx.currentTime, 1.0);
      }
    }

    // 3. Heartbeat pulsing rhythm
    this.startHeartbeatLoop();
  }

  private midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private setupRainGenerator() {
    if (!this.ctx || !this.primaryGain) return;

    // Create custom noise buffer for soft rain
    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Filtered pink noise pattern
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // normalise
      b6 = white * 0.115926;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = noiseBuffer;
    this.rainSource.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = "lowpass";
    this.rainFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime); // start silent

    this.rainSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.primaryGain);

    this.rainSource.start(0);
  }

  private setupVinylCrackle() {
    if (!this.ctx || !this.primaryGain) return;

    // Create a buffer with random clicks
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // White noise base
      let dust = 0;
      if (Math.random() < 0.00015) {
        dust = (Math.random() * 2 - 1) * 0.85; // loud snap
      } else {
        dust = (Math.random() * 2 - 1) * 0.02; // constant hiss
      }
      data[i] = dust;
    }

    this.vinylSource = this.ctx.createBufferSource();
    this.vinylSource.buffer = buffer;
    this.vinylSource.loop = true;

    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = "highpass";
    vinylFilter.frequency.setValueAtTime(150, this.ctx.currentTime);

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // constant dust

    this.vinylSource.connect(vinylFilter);
    vinylFilter.connect(this.vinylGain);
    this.vinylGain.connect(this.primaryGain);

    this.vinylSource.start(0);
  }

  private setupSynthPad() {
    if (!this.ctx || !this.primaryGain) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime); // start silent

    const oscs: OscillatorNode[] = [];
    const notes = [60, 63, 67, 70]; // Root, Minor 3rd, Perfect 5th, Minor 7th

    notes.forEach((midiIn) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(this.midiToFreq(midiIn), this.ctx!.currentTime);
      
      // Detune slightly for lush chorusing
      const detuneVal = (Math.random() * 2 - 1) * 10;
      osc.detune.setValueAtTime(detuneVal, this.ctx!.currentTime);

      osc.connect(filter);
      osc.start(0);
      oscs.push(osc);
    });

    // Setup LFO to sweep filter frequency for cinematic swelling
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // very slow sweep

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime); // sweep bounds (delta Hz)

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(0);

    filter.connect(gain);
    gain.connect(this.primaryGain);

    this.padSynth = { oscs, gain, filter, lfo, lfoGain };
  }

  private startHeartbeatLoop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (!this.ctx) return;

    // Calculate periodic kick beats
    const beatLengthMs = (60 / this.currentBpm) * 1000 * 2; // slow pace

    this.heartbeatInterval = setInterval(() => {
      if (this.ctx && this.isRunning) {
        this.triggerKickPulse();
      }
    }, beatLengthMs);
  }

  private triggerKickPulse() {
    if (!this.ctx || !this.primaryGain) return;

    try {
      // Classic 808 sub kick pulse
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      
      // Punchy sliding sweep
      const isHipHop = this.currentInstrument.includes("saw") || this.currentInstrument.includes("sub") || this.currentInstrument.includes("bass");
      const startFreq = isHipHop ? 110 : 85;
      const endFreq = isHipHop ? 32 : 38;
      const decayTime = isHipHop ? 0.75 : 0.45;

      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + decayTime);

      gain.gain.setValueAtTime(0.48, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + decayTime + 0.1);

      // Distort slightly if drill / hiphop
      let filter: BiquadFilterNode | null = null;
      if (isHipHop) {
        filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, t);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.primaryGain);

      osc.start(t);
      osc.stop(t + decayTime + 0.2);
    } catch (err) {
      // safeguard bounds
    }
  }
}

// Single core global instance to maintain browser resource limits
export const globalAudioEngine = new CinematicAudioEngine();
