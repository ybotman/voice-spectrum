// Application version and changelog
export const APP_VERSION = '1.2.3';

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.3',
    date: '2025-01-24',
    type: 'patch',
    changes: [
      'Fixed rename not persisting to localStorage',
      'Renamed recordings now save automatically and persist across page reloads'
    ]
  },
  {
    version: '1.2.2',
    date: '2025-01-24',
    type: 'patch',
    changes: [
      'Fixed filters not auto-enabling when using presets or adjusting sliders',
      'Filters now automatically enable when you change cutoff frequencies',
      'Full Range preset now properly disables filtering'
    ]
  },
  {
    version: '1.2.1',
    date: '2025-01-24',
    type: 'patch',
    changes: [
      'Fixed AudioContext closing on tab navigation - audio now plays correctly',
      'Fixed auto-switch to Spectrum tab when selecting recording',
      'Swapped Select and Rename button order for better UX'
    ]
  },
  {
    version: '1.2.0',
    date: '2025-01-24',
    type: 'minor',
    changes: [
      'Added vocal range filter presets (50-150 Hz, 100-200 Hz, 300-400 Hz)',
      'Implemented band sliding - click center of spectrogram to slide passband',
      'Renamed "Load" to "Select" with visual selection indicators',
      'Moved file upload to Recordings tab only',
      'Added version display in header and About tab',
      'Created expandable changelog on About page'
    ]
  },
  {
    version: '1.1.0',
    date: '2025-01-24',
    type: 'minor',
    changes: [
      'Added audio trimmer with waveform visualization',
      'Implemented draggable trim handles',
      'Added sample audio loader for public folder files',
      'Created 4-tab navigation (Spectrum, Recordings, Config/Test, About)',
      'Added rename functionality for recordings',
      'Implemented About tab with project information'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-01-24',
    type: 'major',
    changes: [
      'Initial release with core functionality',
      'Extreme brick-wall filtering (16th-order, -192dB/octave)',
      'Real-time spectrogram visualization with logarithmic scale',
      'Audio recording from microphone with anti-clipping',
      'Seamless audio looping',
      'File management (save/load/delete recordings)',
      'Draggable filter controls on spectrogram',
      'Split audio path (unfiltered visualization, filtered playback)',
      'Test tone generator with harmonics',
      'localStorage persistence for recordings'
    ]
  }
];
