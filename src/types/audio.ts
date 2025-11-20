// Audio types for Voice Spectrum application

export interface AudioRecording {
  id: string;
  name: string;
  blob: Blob;
  duration: number;
  createdAt: Date;
}

export interface AudioTrimSettings {
  startTime: number;
  endTime: number;
}

export interface AudioVisualizationSettings {
  fftSize: number;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
}

export interface FilterSettings {
  highPassCutoff: number; // Hz
  lowPassCutoff: number; // Hz
  enabled: boolean;
}

export interface SpectrogramSettings {
  frequencyScale: 'linear' | 'logarithmic';
  minFrequency: number;
  maxFrequency: number;
  colorScheme: 'hot' | 'cool' | 'grayscale';
}

export enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PAUSED = 'paused',
  STOPPED = 'stopped'
}

export enum PlaybackState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped'
}
