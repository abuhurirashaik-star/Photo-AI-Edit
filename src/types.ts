export interface CameraSettings {
  camera: string;
  lens: string;
  iso: string;
  aperture: string;
  shutterSpeed: string;
  filmStock: string;
}

export interface AudioMood {
  tempo: number;
  instrument: string;
  hasRain: boolean;
  description: string;
}

export interface CinematicData {
  title: string;
  backstory: string;
  cameraSettings: CameraSettings;
  audioMood: AudioMood;
  expandedPrompt: string;
  colorPalette: string[];
}

export interface CustomSelections {
  genre: string;
  subject: string;
  lighting: string;
  weather: string;
  cameraStyle: string;
  customNotes: string;
}

export interface SavedPortrait {
  id: string;
  timestamp: string;
  selections: CustomSelections;
  data: CinematicData;
  imageUrl: string; 
}
