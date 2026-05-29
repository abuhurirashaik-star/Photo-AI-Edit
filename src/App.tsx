import { useState, useEffect, useRef, MouseEvent } from "react";
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Download,
  Camera,
  Sparkles,
  RefreshCw,
  Sliders,
  Bookmark,
  Trash2,
  Compass,
  Eye,
  Heart,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Music,
  Check,
  AlertTriangle
} from "lucide-react";
import { CinematicData, CustomSelections, SavedPortrait } from "./types";
import { globalAudioEngine } from "./utils/audioEngine";

// Import generated static portrait assets
// @ts-ignore
import darkStreetPortrait from "./assets/images/dark_street_portrait_1780077087036.png";
// @ts-ignore
import chicagoDrillPortrait from "./assets/images/chicago_drill_portrait_1780077105851.png";

// Preset default setups
const PRESETS: Record<string, { title: string; image: string; data: CinematicData; selections: CustomSelections }> = {
  streetlight_noir: {
    title: "Streetlight Noir",
    image: darkStreetPortrait,
    selections: {
      genre: "Streetlight Noir",
      subject: "A solitary figure in a dark trench coat",
      lighting: "Streetlight Spotlight",
      weather: "Soft Rain",
      cameraStyle: "Vintage 35mm Film Monochrom",
      customNotes: "Classic dark street vintage look, deep shadows"
    },
    data: {
      title: "Streetlight Shadows",
      backstory: "A lone figure stands stationary near the damp corner of 5th Avenue, illuminated only by a single warm halogen lamp. A soft midnight drizzle cascades over their leather trench coat, mirroring the faint static of the sleeping city. He waits in silence, a postcard of unwritten questions in a forgotten noir scene.",
      cameraSettings: {
        camera: "Leica M11 Monochrom",
        lens: "Noctilux-M 50mm f/0.95 ASPH",
        iso: "ISO 1600",
        aperture: "f/0.95",
        shutterSpeed: "1/60s",
        filmStock: "CineStill 800T"
      },
      audioMood: {
        tempo: 55,
        instrument: "low-ambient-sub",
        hasRain: true,
        description: "A slow heartbeat sub bass overlaid with rain whispers and vinyl crackle."
      },
      expandedPrompt: "A classic dark cinematic portrait of a person standing under a streetlight at night, moody shadows, soft rain, dramatic lighting, vintage film look, realistic details, deep black tones, mysterious atmosphere, high contrast, ultra realistic, 4K.",
      colorPalette: ["#020408", "#121824", "#303e54", "#dfb236", "#eceef2"]
    }
  },
  chicagohiphop_drill: {
    title: "Chicago Drill Hip-Hop",
    image: chicagoDrillPortrait,
    selections: {
      genre: "Chicago Drill Hip-Hop",
      subject: "A confident performer in heavy modern streetwear",
      lighting: "Dramatic Rim Lighting",
      weather: "Crisp Cold Night Fog",
      cameraStyle: "Hasselblad Portrait Film",
      customNotes: "Chicago drill aesthetics, expensive coat, urban city background"
    },
    data: {
      title: "Windy City Drill",
      backstory: "Set against a dark, towering urban skyline in Chicago, a stylish hip-hop icon dons premium heavy-weave streetwear. Shimmering crimson rim lights outline their silhouette in the crisp, quiet night, echoing a high-contrast industrial vibe. The ambient bass rattles from distant car speakers, channeling the raw, unapologetic soul of Chicago drill aesthetics.",
      cameraSettings: {
        camera: "Hasselblad X2D 100C",
        lens: "XCD 80mm f/1.9 Mid-Tele",
        iso: "ISO 800",
        aperture: "f/1.9",
        shutterSpeed: "1/125s",
        filmStock: "Kodak Portra 800"
      },
      audioMood: {
        tempo: 73,
        instrument: "dark-saw",
        hasRain: false,
        description: "Heavy dark drill 808 subs accompanied with slow vinyl crackle."
      },
      expandedPrompt: "A stylish hip-hop portrait inspired by classic Chicago drill aesthetics, luxury streetwear, dark urban background, cinematic lighting, realistic photography style, sharp details, moody atmosphere, night city vibes, high contrast, 4K.",
      colorPalette: ["#030303", "#0f111a", "#222938", "#c81326", "#ffffff"]
    }
  },
  tokyo_cyberpunk: {
    title: "Tokyo Neon Cyberpunk",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600",
    selections: {
      genre: "Neon Cyberpunk",
      subject: "An enigmatic tech scavenger looking up",
      lighting: "Saturated Cyan & Pink Neon Glow",
      weather: "Dense Ambient Mist / Smog",
      cameraStyle: "Anamorphic Cinema 4K",
      customNotes: "Drenched under fluorescent signs, heavy reflections on vinyl material"
    },
    data: {
      title: "Neon Rain Shallows",
      backstory: "Drenched under fluorescent crimson and electric teal signage, she pauses in the heart of Shibuya. Reflection of running typography plays across their vinyl visor, mixing with the dense night mist. A quiet observer in a hyper-technological wilderness, caught between analog breathing and digital sleep.",
      cameraSettings: {
        camera: "Sony FX3 Cinema",
        lens: "Cooke Anamorphic Prime 40mm T2.3",
        iso: "ISO 3200",
        aperture: "T2.3",
        shutterSpeed: "1/48s",
        filmStock: "Fujifilm Eterna 250D"
      },
      audioMood: {
        tempo: 80,
        instrument: "warm-pad",
        hasRain: true,
        description: "Slow warm swelling synth pad with high-pass neon hum and rain noise."
      },
      expandedPrompt: "Hyper-detailed Tokyo neon sci-fi portrait, cinematic look, cyan and magenta rim lighting, misty rain, anamorphic lens flares, realistic depth of field.",
      colorPalette: ["#0b0214", "#151130", "#00f0ff", "#ff007f", "#ffffff"]
    }
  },
  london_foggy: {
    title: "London Foggy Cobbles",
    image: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600",
    selections: {
      genre: "Classic British Gothic",
      subject: "A mysterious detective standing in the fog",
      lighting: "Distant Soft Halogen Gaslight",
      weather: "Extremely Heavy Blanket Fog",
      cameraStyle: "Arri Alexa Soft Cine Look",
      customNotes: "Cobblestone alley, East London vibes, moody 1800s mood modernised"
    },
    data: {
      title: "Slick Cobblestones",
      backstory: "An ancient gas-lit passageway in East London blanketed in dense golden fog. The silence is absolute, only interrupted by the quiet dripping of moisture from overhead metal escape arches. It is a timeless capsule of dark gothic mystery, where the fog acts as both a shield and a shroud.",
      cameraSettings: {
        camera: "Arri Alexa Mini LF",
        lens: "Angenieux Optimo 28-76mm Zoom",
        iso: "ISO 1250",
        aperture: "T2.8",
        shutterSpeed: "1/50s",
        filmStock: "Ilford Delta 3200"
      },
      audioMood: {
        tempo: 50,
        instrument: "vinyl-crackle",
        hasRain: false,
        description: "Very low low-pass filter humming pad representing mysterious dense fog."
      },
      expandedPrompt: "East London foggy cobblestone alley at night, gaslight glow, soft focus, high-contrast black and gold shadows, atmospheric haze, movie frame.",
      colorPalette: ["#060604", "#1d1f18", "#5c573e", "#ebd58a", "#f4f3ef"]
    }
  }
};

const GENRE_CHOICES = ["Streetlight Noir", "Chicago Drill Hip-Hop", "Neon Cyberpunk", "Classic British Gothic", "Retro Cinema", "Raw Documentary"];
const LIGHTING_CHOICES = ["Streetlight Spotlight", "Dramatic Rim Lighting", "High-Contrast Chiaroscuro", "Saturated Dual Tone", "Soft Diffused Halogen", "Harsh Underlighting"];
const WEATHER_CHOICES = ["Soft Rain", "Dense Fog / Mist", "Slick Damp Atmosphere", "Bone-Dry Midnight Chill", "Distant Lightnings", "Heavy Downpour"];
const CAMERA_CHOICES = ["Vintage 35mm Film Monochrom", "Medium Format Film (Hasselblad)", "Modern Digital Cinema (Arri Alexa)", "Anamorphic Cinematic Lens Look", "High-Gain Raw DSLR", "Polaroid Soft Vintage"];

export default function App() {
  // Preset selection
  const [activePresetKey, setActivePresetKey] = useState<string>("streetlight_noir");
  const [customSelections, setCustomSelections] = useState<CustomSelections>(PRESETS.streetlight_noir.selections);
  const [cinematicData, setCinematicData] = useState<CinematicData>(PRESETS.streetlight_noir.data);
  const [activeImage, setActiveImage] = useState<string>(PRESETS.streetlight_noir.image);

  // Client visual filters sliders state
  const [filterNoir, setFilterNoir] = useState<number>(100);       // Contrast (100 - 180)
  const [filterTemp, setFilterTemp] = useState<number>(0);         // Tint (hue-rotate -30 to +30 / or sepia)
  const [filterSaturate, setFilterSaturate] = useState<number>(100); // Saturation (0 - 150)
  const [filterVignette, setFilterVignette] = useState<number>(40);   // Dark border bounds (10 - 70)
  const [filmGrainOpacity, setFilmGrainOpacity] = useState<number>(20); // Noise overlay
  
  // App system states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flashTrigger, setFlashTrigger] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(75);
  const [fullCinemaMode, setFullCinemaMode] = useState<boolean>(false);
  const [savedPortraits, setSavedPortraits] = useState<SavedPortrait[]>([]);
  const [isNotificationSuccess, setIsNotificationSuccess] = useState<string | null>(null);

  // Rain animation canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rainAnimationIdRef = useRef<number | null>(null);

  // Load collection from localStorage on start
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cinematic_studio_collection");
      if (stored) {
        setSavedPortraits(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read saved collection", e);
    }
  }, []);

  // Sync state to localstorage
  const saveCollectionToStorage = (updated: SavedPortrait[]) => {
    try {
      localStorage.setItem("cinematic_studio_collection", JSON.stringify(updated));
    } catch (e) {
      console.error("Could not write collection to storage", e);
    }
  };

  // Sync procedural audio on changes
  useEffect(() => {
    if (isPlayingAudio) {
      globalAudioEngine.updateSettings(
        cinematicData.audioMood.instrument,
        cinematicData.audioMood.tempo,
        cinematicData.audioMood.hasRain
      );
    }
  }, [cinematicData, isPlayingAudio]);

  // Handle Preset Loader
  const handleLoadPreset = (key: string) => {
    setActivePresetKey(key);
    const selected = PRESETS[key];
    if (selected) {
      setCustomSelections(selected.selections);
      setCinematicData(selected.data);
      setActiveImage(selected.image);
      
      // Default reset filters slightly based on genre
      if (key === "streetlight_noir") {
        setFilterNoir(140);
        setFilterTemp(-10); // cold teal
        setFilterSaturate(10); // almost monochrom
      } else if (key === "chicagohiphop_drill") {
        setFilterNoir(125);
        setFilterTemp(5); // dramatic warm hints
        setFilterSaturate(110);
      } else if (key === "tokyo_cyberpunk") {
        setFilterNoir(115);
        setFilterTemp(-25); // neon cyan glow focus
        setFilterSaturate(140); // highly saturated
      } else {
        setFilterNoir(110);
        setFilterTemp(15); // soft gold
        setFilterSaturate(70); 
      }

      // Flash feedback
      triggerFlashEffect();
    }
  };

  // Trigger white screen camera flash transition
  const triggerFlashEffect = () => {
    setFlashTrigger(true);
    const t = setTimeout(() => setFlashTrigger(false), 550);
    return () => clearTimeout(t);
  };

  // Canvas Rain Animator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle sizing based on container bounds
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Rain drop objects
    const maxDrops = 60;
    const drops: Array<{ x: number; y: number; length: number; speed: number; opacity: number }> = [];
    
    for (let i = 0; i < maxDrops; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 15 + 15,
        opacity: Math.random() * 0.35 + 0.15
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Only draw if rain is enabled in the current cinematic data or selected
      const isRainy = cinematicData.audioMood.hasRain;
      if (isRainy) {
        ctx.lineCap = "round";
        for (let i = 0; i < maxDrops; i++) {
          const d = drops[i];
          
          // Slight slant representing atmospheric wind
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 1, d.y + d.length);
          ctx.strokeStyle = `rgba(180, 210, 255, ${d.opacity})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Move down
          d.y += d.speed;
          d.x -= 0.5; // slow drift

          // Reset if bottom reached
          if (d.y > canvas.height) {
            d.y = -d.length;
            d.x = Math.random() * canvas.width;
            d.speed = Math.random() * 12 + 15;
          }
        }
      }

      rainAnimationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (rainAnimationIdRef.current) {
        cancelAnimationFrame(rainAnimationIdRef.current);
      }
    };
  }, [cinematicData]);

  // Audio Toggle
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      globalAudioEngine.stop();
      setIsPlayingAudio(false);
    } else {
      globalAudioEngine.start();
      globalAudioEngine.updateSettings(
        cinematicData.audioMood.instrument,
        cinematicData.audioMood.tempo,
        cinematicData.audioMood.hasRain
      );
      setIsPlayingAudio(true);
    }
  };

  // Send request to full-stack Gemini API generator backend
  const handleApiGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/cinematic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customSelections)
      });

      const resJson = await response.json();
      
      if (!response.ok) {
        throw new Error(resJson.error || "Failed to communicate with full-stack server.");
      }

      if (resJson.success && resJson.data) {
        setCinematicData(resJson.data);
        setActivePresetKey(""); // unhighlight presets

        // If the backend generated an image successfully, load it!
        if (resJson.generatedImage) {
          setActiveImage(resJson.generatedImage);
        } else {
          // If no image generated, keep active or assign a gorgeous seed photo matching the genre:
          const lowerGenre = customSelections.genre.toLowerCase();
          if (lowerGenre.includes("drill") || lowerGenre.includes("hip")) {
            setActiveImage(chicagoDrillPortrait);
          } else if (lowerGenre.includes("noir") || lowerGenre.includes("street")) {
            setActiveImage(darkStreetPortrait);
          } else if (lowerGenre.includes("cyber") || lowerGenre.includes("tokyo")) {
            setActiveImage(PRESETS.tokyo_cyberpunk.image);
          } else {
            setActiveImage(PRESETS.london_foggy.image);
          }
        }
        
        // Trigger camera flash for cinematic feel
        triggerFlashEffect();
        showNotification("Cinematic portrait updated dynamically!");

        // Automatically configure audio engine with the new settings
        if (isPlayingAudio) {
          globalAudioEngine.updateSettings(
            resJson.data.audioMood.instrument,
            resJson.data.audioMood.tempo,
            resJson.data.audioMood.hasRain
          );
        }
      } else {
        throw new Error("Invalid response envelope from backend generator.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while communicating with Gemini API.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save active set to My Collection
  const handleSaveToCollection = () => {
    const fresh: SavedPortrait = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      selections: { ...customSelections },
      data: { ...cinematicData },
      imageUrl: activeImage
    };

    const updated = [fresh, ...savedPortraits];
    setSavedPortraits(updated);
    saveCollectionToStorage(updated);
    showNotification("Portrait framed and saved into collection!");
  };

  // Delete from collection
  const handleDeleteSaved = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = savedPortraits.filter(item => item.id !== id);
    setSavedPortraits(updated);
    saveCollectionToStorage(updated);
    showNotification("Frame removed.");
  };

  // Reload a saved frame
  const handleLoadSaved = (item: SavedPortrait) => {
    setCustomSelections(item.selections);
    setCinematicData(item.data);
    setActiveImage(item.imageUrl);
    setActivePresetKey("");
    triggerFlashEffect();
    showNotification("Loaded saved frame into workshop.");
  };

  // Helper to show brief check notification
  const showNotification = (msg: string) => {
    setIsNotificationSuccess(msg);
    setTimeout(() => setIsNotificationSuccess(null), 3000);
  };

  // Construct download trigger helper
  const handleDownloadImage = () => {
    try {
      const link = document.createElement("a");
      link.href = activeImage;
      link.download = `${cinematicData.title.replace(/\s+/g, "_").toLowerCase()}_portrait.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Downloading portrait...");
    } catch (e) {
      window.open(activeImage, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-200 font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* Dynamic Flash Screen */}
      {flashTrigger && (
        <div className="fixed inset-0 bg-white z-50 pointer-events-none transition-opacity duration-500 ease-out opacity-75" />
      )}

      {/* Floating notifications */}
      {isNotificationSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-[#161a24] text-amber-400 border border-amber-500/20 px-4 py-3 rounded-md shadow-2xl flex items-center space-x-2 text-xs font-mono animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{isNotificationSuccess}</span>
        </div>
      )}

      {/* Main Top Navigation Heading */}
      <header className="border-b border-gray-900 bg-[#090a0e]/85 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Camera className="w-4.5 h-4.5 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider font-display text-white uppercase">
                Cinematic Portrait Studio
              </h1>
              <p className="text-[10px] text-gray-400 font-mono">
                Noir Candela & Chicago Drill Atmosphere Sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Audio State Pulse */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono transition ${
                isPlayingAudio
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "bg-gray-900 border border-gray-800 text-gray-500 hover:text-gray-300"
              }`}
              title="Toggle procedural background noise and synth mood"
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[10px]">SOUND LIVE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="text-[10px]">SOUND OFF</span>
                </>
              )}
            </button>

            <button
              onClick={() => setFullCinemaMode(!fullCinemaMode)}
              className={`p-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition ${
                fullCinemaMode ? "text-amber-400 border-amber-500/40" : ""
              }`}
              title="Cinema Focus Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Director controls & Preset styling, occupies 4 cols */}
          <section className={`lg:col-span-4 space-y-6 ${fullCinemaMode ? "hidden" : "block"}`}>
            
            {/* Presets Grid */}
            <div className="bg-[#0b0c10] border border-gray-900 rounded-xl p-4 shadow-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Compass className="w-4.5 h-4.5 text-amber-500" />
                <h2 className="text-xs uppercase font-bold tracking-wider font-display text-white">
                  Aesthetic Templates
                </h2>
              </div>
              <p className="text-[11px] text-gray-400 mb-4 font-sans">
                Select a dark nocturnal palette choice to calibrate details instantly:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESETS).map(([key, item]) => {
                  const isActive = activePresetKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleLoadPreset(key)}
                      className={`text-left rounded-lg p-2.5 transition border overflow-hidden relative group font-sans ${
                        isActive
                          ? "bg-amber-500/5 border-amber-500/60 text-white"
                          : "bg-gray-950/70 border-gray-900 text-gray-400 hover:border-gray-800 hover:text-white"
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-8 h-8 opacity-10 font-mono text-[24px] select-none text-right font-bold pointer-events-none group-hover:scale-110 transition-transform">
                        #
                      </div>
                      <div className="text-[11px] font-bold tracking-wide block truncate">
                        {item.title}
                      </div>
                      <div className="text-[9px] font-mono text-gray-500 mt-1 truncate">
                        {item.selections.lighting}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Interactive Prompt Builder Form */}
            <div className="bg-[#0b0c10] border border-gray-900 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4.5 h-4.5 text-amber-500" />
                  <h2 className="text-xs uppercase font-bold tracking-wider font-display text-white">
                    Directors Desk
                  </h2>
                </div>
                <span className="text-[9px] font-mono bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                  SANDBOX
                </span>
              </div>

              {/* Selector 1: Genre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
                  1. Scene Genre / Style
                </label>
                <select
                  value={customSelections.genre}
                  onChange={(e) => setCustomSelections({ ...customSelections, genre: e.target.value })}
                  className="w-full text-xs bg-gray-950 border border-gray-900 rounded p-2 text-white outline-none focus:border-amber-500 transition font-sans"
                >
                  {GENRE_CHOICES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Selector 2: Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
                  2. Focus Subject
                </label>
                <input
                  type="text"
                  value={customSelections.subject}
                  onChange={(e) => setCustomSelections({ ...customSelections, subject: e.target.value })}
                  placeholder="e.g. A silent nomad looking to the skies"
                  className="w-full text-xs bg-gray-950 border border-gray-900 rounded p-2 text-white outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Selector 3: Lighting */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
                  3. Light Projection
                </label>
                <select
                  value={customSelections.lighting}
                  onChange={(e) => setCustomSelections({ ...customSelections, lighting: e.target.value })}
                  className="w-full text-xs bg-gray-950 border border-gray-900 rounded p-2 text-white outline-none focus:border-amber-500 transition font-sans"
                >
                  {LIGHTING_CHOICES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Selector 4: Weather/Acoustics */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
                  4. Weather Conditioning
                </label>
                <select
                  value={customSelections.weather}
                  onChange={(e) => setCustomSelections({ ...customSelections, weather: e.target.value })}
                  className="w-full text-xs bg-gray-950 border border-gray-900 rounded p-2 text-white outline-none focus:border-amber-500 transition font-sans"
                >
                  {WEATHER_CHOICES.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Selector 5: Camera/Film */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
                  5. Camera Emulation
                </label>
                <select
                  value={customSelections.cameraStyle}
                  onChange={(e) => setCustomSelections({ ...customSelections, cameraStyle: e.target.value })}
                  className="w-full text-xs bg-gray-950 border border-gray-900 rounded p-2 text-white outline-none focus:border-amber-500 transition font-sans"
                >
                  {CAMERA_CHOICES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Textarea: Custom Directives */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
                  6. Extra Details / Directives
                </label>
                <textarea
                  value={customSelections.customNotes}
                  onChange={(e) => setCustomSelections({ ...customSelections, customNotes: e.target.value })}
                  rows={2}
                  placeholder="e.g. Leather mask, glowing neon street lights, cinematic orange light sweep..."
                  className="w-full text-xs bg-gray-950 border border-gray-900 rounded p-2 text-white outline-none focus:border-amber-500 transition font-sans resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={handleApiGenerate}
                  disabled={isGenerating}
                  className="w-full py-2.5 px-4 rounded bg-amber-500 text-black font-bold text-xs uppercase tracking-wider font-display hover:bg-amber-400 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>DIRECTING SCENE...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>COMPILE CINEMATIC FRAME</span>
                    </>
                  )}
                </button>
                
                {/* Notice below */}
                <p className="text-[9px] text-gray-500 font-mono text-center mt-2">
                  Powered by server-side Gemini 3.5 Flash logic
                </p>
              </div>

              {/* Gemini Error Guard Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded text-red-400 text-[11px] font-mono flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Generation error: </span>
                    {errorMsg}
                  </div>
                </div>
              )}
            </div>

            {/* Collection Saved Portrait Tray */}
            <div className="bg-[#0b0c10] border border-gray-900 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4.5 h-4.5 text-amber-500" />
                  <h2 className="text-xs uppercase font-bold tracking-wider font-display text-white">
                    Private Collection
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                  {savedPortraits.length} saved
                </span>
              </div>

              {savedPortraits.length === 0 ? (
                <div className="py-6 border border-dashed border-gray-900 rounded-lg text-center font-mono">
                  <p className="text-[10px] text-gray-500">No frames collected yet.</p>
                  <p className="text-[9px] text-gray-600 mt-1">Click frame save underneath the picture portal.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedPortraits.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSaved(item)}
                      className="group flex items-center justify-between p-2 rounded bg-gray-950 border border-gray-900 hover:border-gray-800 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.data.title}
                          className="w-10 h-12 object-cover rounded bg-gray-900 border border-gray-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-white truncate">
                            {item.data.title}
                          </h4>
                          <span className="text-[9px] font-mono text-gray-500 block">
                            {item.data.cameraSettings.filmStock} • {item.timestamp}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                        title="Remove frame"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

          {/* CENTER PANEL: Main active view stage, occupies 5 or 8 cols */}
          <section className={`${fullCinemaMode ? "lg:col-span-8 lg:col-start-3" : "lg:col-span-5"} space-y-6`}>
            
            {/* Visual Canvas Port */}
            <div className="bg-black border border-gray-900 rounded-xl overflow-hidden shadow-2xl relative">
              
              {/* Card Title Label (Simulated technical frame overlay) */}
              <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur border border-white/5 py-1 px-2 rounded text-[9px] font-mono text-gray-400">
                REC • {cinematicData.audioMood.tempo} BPM • ASPECT 3:4
              </div>

              {/* Cinema scale focus indicator */}
              <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5">
                {cinematicData.audioMood.hasRain && (
                  <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 py-0.5 px-1.5 rounded-[3px] text-[8px] font-mono uppercase tracking-wide">
                    Rain Overlay
                  </div>
                )}
                {activePresetKey && (
                  <div className="bg-amber-500/15 text-amber-400 border border-amber-500/20 py-0.5 px-1.5 rounded-[3px] text-[8px] font-mono uppercase tracking-wide">
                    PRESET ORIGINAL
                  </div>
                )}
              </div>

              {/* The Picture Canvas Wrapper */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-950 flex items-center justify-center">
                
                {/* Image element with dynamically modulated Web-filters */}
                <img
                  src={activeImage}
                  alt={cinematicData.title}
                  className="w-full h-full object-cover select-none transition-all duration-300 transform scale-102"
                  style={{
                    filter: `contrast(${filterNoir}%) hue-rotate(${filterTemp}deg) saturate(${filterSaturate}%) grayscale(${filterSaturate === 10 ? 90 : 0}%)`,
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* Soft CSS Vignette Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-all"
                  style={{
                    boxShadow: `inset 0 0 ${filterVignette * 1.8}px rgba(0,0,0,0.9)`,
                    background: `radial-gradient(circle, transparent ${100 - filterVignette}%, rgba(0,0,0,0.85) 100%)`
                  }}
                />

                {/* Subtle Cinematic Film Grain dust sheet */}
                <div 
                  className="absolute inset-0 pointer-events-none film-grain"
                  style={{ opacity: filmGrainOpacity / 100 }}
                />

                {/* Live Rainfall Canvas */}
                <canvas 
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none z-10"
                />

                {/* Ambient Visual Sound visualizer bars */}
                {isPlayingAudio && (
                  <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-sm border border-white/5 p-1 px-1.5 rounded flex items-center space-x-1 font-mono text-[8px] text-emerald-400">
                    <Music className="w-2.5 h-2.5 text-emerald-400 animate-bounce" />
                    <div className="flex space-x-[2px] items-end h-2.5">
                      <span className="w-[1.5px] bg-emerald-400 h-2 animate-[pulse_0.4s_infinite]" />
                      <span className="w-[1.5px] bg-emerald-400 h-1.5 animate-[pulse_0.6s_infinite]" />
                      <span className="w-[1.5px] bg-emerald-400 h-2.5 animate-[pulse_0.5s_infinite]" />
                      <span className="w-[1.5px] bg-emerald-400 h-1 animate-[pulse_0.7s_infinite]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Quick Controls */}
              <div className="bg-[#090b0e] border-t border-gray-900 p-3 flex items-center justify-between text-xs">
                
                {/* Ambient audio toggle in view-deck */}
                <button
                  onClick={handleToggleAudio}
                  className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition font-mono text-[10px]"
                >
                  <Music className={`w-3.5 h-3.5 ${isPlayingAudio ? "text-amber-500 animate-spin" : ""}`} />
                  <span>{isPlayingAudio ? "PAUSE ATMOSPHERE" : "PLAY ATMOSPHERE"}</span>
                </button>

                <div className="flex space-x-2">
                  {/* Bookmark frame */}
                  <button
                    onClick={handleSaveToCollection}
                    className="flex items-center space-x-1.5 py-1 px-2.5 rounded bg-gray-950 border border-gray-800 text-gray-400 hover:text-white transition font-sans text-[10px]"
                    title="Add current framing setup to personal bookmark roll"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500/80 fill-rose-500/10" />
                    <span>SAVE FRAME</span>
                  </button>

                  {/* Manual download frame */}
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center space-x-1.5 py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition font-sans text-[10px]"
                    title="Save current picture out of studio"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Atmospheric Sliders Custom Filters Box */}
            <div className="bg-[#0b0c10] border border-gray-900 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="text-xs uppercase font-bold tracking-wider font-display text-white">
                  Post-Production Processing
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Contrast / Noir */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] h-3.5 font-mono text-gray-400">
                    <span>CONTRAST</span>
                    <span>{filterNoir}%</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="180"
                    value={filterNoir}
                    onChange={(e) => setFilterNoir(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-gray-900 rounded"
                  />
                </div>

                {/* Color Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] h-3.5 font-mono text-gray-400">
                    <span>SATURATION</span>
                    <span>{filterSaturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="160"
                    value={filterSaturate}
                    onChange={(e) => setFilterSaturate(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-gray-900 rounded"
                  />
                </div>

                {/* Color/Tint Temperature */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] h-3.5 font-mono text-gray-400">
                    <span>TEMPERATURE</span>
                    <span>{filterTemp > 0 ? `+${filterTemp}` : filterTemp}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={filterTemp}
                    onChange={(e) => setFilterTemp(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-gray-900 rounded"
                  />
                </div>

                {/* Vignette Shadow border */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] h-3.5 font-mono text-gray-400">
                    <span>VIGNETTE</span>
                    <span>{filterVignette}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={filterVignette}
                    onChange={(e) => setFilterVignette(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-gray-900 rounded"
                  />
                </div>
              </div>

              {/* Additional controls inside */}
              <div className="pt-2 border-t border-gray-950 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 inline-block" />
                    <span>LENS EFFECT: ACTIVE</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 inline-block" />
                    <span>FILM GRAIN: {filmGrainOpacity}%</span>
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setFilterNoir(120);
                    setFilterTemp(0);
                    setFilterSaturate(100);
                    setFilterVignette(40);
                    setFilmGrainOpacity(20);
                  }}
                  className="text-gray-400 hover:text-white transition underline"
                >
                  RESET GRADING
                </button>
              </div>

            </div>

          </section>

          {/* RIGHT PANEL: Dynamic Story details & Camera Logs, occupies 3 cols */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* Immersive backstory & narrative detailing */}
            <div className="bg-[#0b0c10] border border-gray-900 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="text-xs uppercase font-bold tracking-wider font-display text-white">
                  Scene Lore & Backstory
                </h3>
              </div>

              <div className="border hover:border-gray-800 border-gray-950 bg-gray-950/60 p-3 rounded-lg relative overflow-hidden transition">
                <span className="text-[8px] font-mono text-gray-500 absolute top-1 right-2 uppercase tracking-tight">
                  DIR NOTE
                </span>
                
                <h2 className="text-sm font-bold text-amber-400 tracking-wider font-display mb-2 border-b border-gray-900 pb-1 uppercase italic">
                  "{cinematicData.title}"
                </h2>
                
                <p className="text-xs text-gray-300 leading-relaxed font-sans first-letter:text-2xl first-letter:font-bold first-letter:text-amber-400 first-letter:mr-1.5 first-letter:float-left">
                  {cinematicData.backstory}
                </p>
              </div>

              {/* Dynamic Theme Color Palette Swatches */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">
                  Frame Color Grade Palette
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {cinematicData.colorPalette.map((colHex, index) => (
                    <div
                      key={index}
                      className="group relative cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(colHex);
                        showNotification(`Copied color ${colHex}`);
                      }}
                      title="Click to copy Hex Code"
                    >
                      <div
                        className="h-9 rounded border border-white/5 transition group-hover:scale-105"
                        style={{ backgroundColor: colHex }}
                      />
                      <span className="absolute -bottom-3 left-0 right-0 text-[8px] font-mono text-gray-500 text-center uppercase truncate">
                        {colHex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Directors technical camera log frame details */}
            <div className="bg-[#0b0c10] border border-gray-900 rounded-xl p-4 shadow-xl font-mono">
              <div className="flex items-center space-x-2 mb-3">
                <Camera className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="text-xs uppercase font-bold tracking-wider font-display text-white">
                  Metadata Log
                </h3>
              </div>

              <div className="space-y-2 text-[10px] divide-y divide-gray-950">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">CAMERA BODY</span>
                  <span className="text-gray-100 font-bold select-all">{cinematicData.cameraSettings.camera}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">LENS PROFILE</span>
                  <span className="text-gray-100 font-bold select-all">{cinematicData.cameraSettings.lens}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">ISO INDEX</span>
                  <span className="text-gray-300 font-bold">{cinematicData.cameraSettings.iso}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">APERTURE</span>
                  <span className="text-amber-400 font-bold">{cinematicData.cameraSettings.aperture}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">SHUTTER TIME</span>
                  <span className="text-gray-300 font-bold">{cinematicData.cameraSettings.shutterSpeed}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">FILM EMULATION</span>
                  <span className="text-amber-400 font-bold tracking-wider">{cinematicData.cameraSettings.filmStock}</span>
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded bg-gray-950 border border-gray-900">
                <span className="text-[8px] text-amber-500 block uppercase tracking-wider font-bold mb-1">
                  Calculated Sound Mood
                </span>
                <p className="text-[10px] text-gray-400 leading-normal">
                  {cinematicData.audioMood.description}
                </p>
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="text-[9px] text-gray-500">TEMPO:</span>
                  <span className="text-[10px] text-white font-bold">{cinematicData.audioMood.tempo} BPM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Fine print guide box */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 font-sans text-xs text-amber-400/80 leading-relaxed">
              <div className="flex items-center space-x-1.5 mb-1.5 font-bold uppercase tracking-wider text-xs text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Interactive Acoustics</span>
              </div>
              When dynamic sound is toggled on, a fully synthetic realtime modular synthesizer is generated inside your browser! Experience a rhythmic kick beat matching the precise BPM, a soft atmospheric pad, and raining overlays.
            </div>

          </section>

        </div>
      </main>

      {/* Decorative page margin footer */}
      <footer className="border-t border-gray-900 bg-black/40 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] text-gray-500">
          <div>
            © 2026 CINEMATIC PORTRAIT STUDIO • NOCTURNAL LABS INC
          </div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <span>PLATFORM: VITE/REACT/EXPRESS/TS</span>
            <span>GEMINI CORE: ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
