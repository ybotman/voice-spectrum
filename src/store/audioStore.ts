import { create } from 'zustand';
import {
  AudioRecording,
  AudioTrimSettings,
  FilterSettings,
  SpectrogramSettings,
  RecordingState,
  PlaybackState,
  AudioVisualizationSettings
} from '../types/audio';
import { saveRecordingsToStorage } from '../utils/localStorage';

interface AudioState {
  // Recording state
  recordingState: RecordingState;
  currentRecording: AudioRecording | null;
  recordings: AudioRecording[];

  // Playback state
  playbackState: PlaybackState;
  currentAudioBuffer: AudioBuffer | null;
  selectedRecording: AudioRecording | null;

  // Audio context
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;

  // Settings
  trimSettings: AudioTrimSettings;
  filterSettings: FilterSettings;
  spectrogramSettings: SpectrogramSettings;
  visualizationSettings: AudioVisualizationSettings;

  // Actions
  setRecordingState: (state: RecordingState) => void;
  setCurrentRecording: (recording: AudioRecording | null) => void;
  addRecording: (recording: AudioRecording) => void;
  removeRecording: (id: string) => void;
  setRecordings: (recordings: AudioRecording[]) => void;

  setPlaybackState: (state: PlaybackState) => void;
  setCurrentAudioBuffer: (buffer: AudioBuffer | null) => void;
  setSelectedRecording: (recording: AudioRecording | null) => void;

  setAudioContext: (context: AudioContext | null) => void;
  setAnalyserNode: (node: AnalyserNode | null) => void;

  setTrimSettings: (settings: AudioTrimSettings) => void;
  setFilterSettings: (settings: FilterSettings) => void;
  setSpectrogramSettings: (settings: SpectrogramSettings) => void;
  setVisualizationSettings: (settings: AudioVisualizationSettings) => void;

  reset: () => void;
}

const initialState = {
  recordingState: RecordingState.IDLE,
  currentRecording: null,
  recordings: [],

  playbackState: PlaybackState.IDLE,
  currentAudioBuffer: null,
  selectedRecording: null,

  audioContext: null,
  analyserNode: null,

  trimSettings: {
    startTime: 0,
    endTime: 0
  },

  filterSettings: {
    highPassCutoff: 0,
    lowPassCutoff: 20000,
    enabled: false
  },

  spectrogramSettings: {
    frequencyScale: 'linear' as const,
    minFrequency: 0,
    maxFrequency: 20000,
    colorScheme: 'hot' as const
  },

  visualizationSettings: {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -90,
    maxDecibels: -10
  }
};

export const useAudioStore = create<AudioState>((set) => ({
  ...initialState,

  setRecordingState: (recordingState) => set({ recordingState }),
  setCurrentRecording: (currentRecording) => set({ currentRecording }),
  addRecording: (recording) => set((state) => {
    const newRecordings = [...state.recordings, recording];
    // Auto-save to localStorage
    saveRecordingsToStorage(newRecordings);
    return { recordings: newRecordings };
  }),
  removeRecording: (id) => set((state) => {
    const newRecordings = state.recordings.filter((r) => r.id !== id);
    // Auto-save to localStorage
    saveRecordingsToStorage(newRecordings);
    return { recordings: newRecordings };
  }),
  setRecordings: (recordings) => set({ recordings }),

  setPlaybackState: (playbackState) => set({ playbackState }),
  setCurrentAudioBuffer: (currentAudioBuffer) => set({ currentAudioBuffer }),
  setSelectedRecording: (selectedRecording) => set({ selectedRecording }),

  setAudioContext: (audioContext) => set({ audioContext }),
  setAnalyserNode: (analyserNode) => set({ analyserNode }),

  setTrimSettings: (trimSettings) => set({ trimSettings }),
  setFilterSettings: (filterSettings) => set({ filterSettings }),
  setSpectrogramSettings: (spectrogramSettings) => set({ spectrogramSettings }),
  setVisualizationSettings: (visualizationSettings) => set({ visualizationSettings }),

  reset: () => set(initialState)
}));
