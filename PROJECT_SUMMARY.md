# Voice Spectrum Analyzer - Complete Project Summary

## Project Overview

**Name:** Voice Spectrum Analyzer
**Version:** 1.2.4
**Purpose:** Demonstrate that all sounds are composed of simple sinusoidal waves at different frequencies
**Creator:** Toby Balsley, HDTS LLC
**Deployment:** https://voice-spectrum.vercel.app
**Repository:** https://github.com/ybotman/voice-spectrum
**JIRA:** https://hdtsllc.atlassian.net/browse/VOICE

## Core Mission

This application proves that **all sounds—voice, instruments, environmental noise—are composed entirely of simple sinusoidal waves at different frequencies**. By isolating narrow frequency bands with extreme precision filters, users can hear individual sine wave components that combine to create what we perceive as complex sounds. When filtering to just 150-250 Hz from a voice recording, you hear only the fundamental frequency isolated from its harmonics, proving that even rich, recognizable sounds are built from basic sine waves stacked at multiples of the fundamental.

## Technology Stack

### Frontend Framework
- **React 18** - Component-based UI
- **TypeScript** - Type-safe development
- **TailwindCSS v3** - Utility-first styling
- **Create React App** - Build tooling

### Audio Processing
- **Web Audio API** - Core audio engine
  - AudioContext - Audio processing graph
  - AnalyserNode - FFT analysis for visualization
  - BiquadFilterNode - 16th-order cascaded filters
  - AudioBufferSourceNode - Audio playback
  - MediaStreamAudioSourceNode - Microphone input
  - GainNode - Volume control and anti-clipping
- **MediaRecorder API** - Recording from microphone
- **Canvas API** - Real-time spectrogram rendering

### State Management
- **Zustand** - Lightweight state management
- **localStorage** - Persistence for recordings and settings

### Build & Deployment
- **npm** - Package management
- **ESLint** - Code quality
- **Jest + React Testing Library** - Unit/integration tests
- **Vercel** - Hosting with auto-deployment from GitHub
- **GitHub** - Version control and CI/CD

## Application Architecture

### Component Structure

```
App.tsx (Main container with TabNavigation)
├── TabNavigation (4 tabs with localStorage persistence)
│   ├── Tab 1: Spectrum (Visualization & Playback)
│   │   ├── FilterControls (Band-pass filter presets and sliders)
│   │   ├── AudioPlayback (Play/Pause/Stop controls)
│   │   └── Spectrogram (Real-time FFT visualization)
│   │
│   ├── Tab 2: Recordings (Input & Management)
│   │   ├── AudioRecorder (Microphone recording)
│   │   ├── FileUploader (Upload from device)
│   │   ├── SampleAudioLoader (Load from public folder)
│   │   ├── AudioTrimmer (Waveform editing)
│   │   └── RecordingsList (Select/Rename/Save/Delete)
│   │
│   ├── Tab 3: Config/Test (Diagnostics)
│   │   ├── DeviceInfo (Audio hardware info)
│   │   └── TestToneGenerator (Generate test tones)
│   │
│   └── Tab 4: About (Documentation)
│       ├── Project mission and goals
│       ├── Technology stack info
│       ├── Use cases
│       └── Expandable changelog
```

### Custom Hooks

- **useAudioContext** - Initializes and manages AudioContext
- **useAudioPlayback** - Handles playback, filters, looping
- **useAudioRecorder** - Microphone recording with anti-clipping
- **useLoadRecordings** - Loads persisted recordings on startup

### State Management (Zustand Store)

```typescript
audioStore {
  // UI State
  activeTab: TabType

  // Recording State
  recordingState: RecordingState
  currentRecording: AudioRecording | null
  recordings: AudioRecording[]

  // Playback State
  playbackState: PlaybackState
  currentAudioBuffer: AudioBuffer | null
  selectedRecording: AudioRecording | null
  loopEnabled: boolean

  // Audio Context
  audioContext: AudioContext | null
  analyserNode: AnalyserNode | null

  // Settings
  filterSettings: FilterSettings
  spectrogramSettings: SpectrogramSettings
  visualizationSettings: AudioVisualizationSettings
}
```

## Key Features

### 1. Extreme Brick-Wall Filtering
- **32 cascaded BiquadFilterNodes** (16 high-pass + 16 low-pass)
- **-192dB/octave rolloff** - Near-perfect square frequency response
- Butterworth topology (Q = 0.7071) for maximally flat passband
- Real-time adjustable cutoff frequencies
- Draggable controls on spectrogram visualization

### 2. Split Audio Path Architecture
```
Audio Source
├─→ Path 1: Analyser → Visualization (unfiltered, full spectrum)
└─→ Path 2: 32 Filters → Speakers (filtered audio output)
```
This allows users to **see the full spectrum** while **hearing only the filtered passband**.

### 3. Real-Time Spectrogram
- **8192-point FFT** (~5.86 Hz resolution at 48kHz)
- Logarithmic frequency scale (better for low frequencies)
- 0-20,000 Hz range
- Hot colormap (black → red → yellow → white)
- Scrolling time display
- Interactive filter controls (click edges to adjust, click center to slide band)

### 4. Audio Recording
- Microphone input with MediaRecorder API
- **Anti-clipping protection:**
  - Disabled autoGainControl, noiseSuppression, echoCancellation
  - 50% GainNode to prevent distortion
  - 48kHz sample rate
- Real-time visualization during recording
- Save as WAV format

### 5. File Management
- Upload audio files from device (WAV, MP3, etc.)
- Load sample audio from public folder
- Rename recordings with inline editing
- Delete recordings
- Download as WAV to Downloads folder
- localStorage persistence across page reloads

### 6. Audio Trimming
- Waveform visualization on canvas
- Draggable trim handles (start/end points)
- Click waveform to set positions
- Range sliders for precise control
- Creates new trimmed recording (preserves original)

### 7. Filter Presets
- **Clean Below 125 Hz** - Removes low-frequency noise/rumble
- **200 Hz Fundamental** (150-250 Hz) - Isolate voice fundamentals
- **300 Hz Fundamental** (250-350 Hz)
- **400 Hz Fundamental** (350-450 Hz)
- **Full Range (No Filter)** - Disables filtering
- Auto-enable when adjusting sliders or using presets

### 8. Test Tone Generator
- Generate pure sine waves at any frequency
- Add harmonics (2nd, 3rd, 4th)
- Adjustable duration
- Useful for verifying filter performance

## Major Technical Challenges & Solutions

### Challenge 1: AudioContext Closing on Tab Navigation
**Problem:** Switching tabs unmounted components, triggering cleanup that closed AudioContext. Once closed, it couldn't be reopened.

**Error Messages:**
```
Construction of AudioBufferSourceNode is not useful when context is closed.
Connecting nodes after the context has been closed is not useful.
```

**Solution:** Removed AudioContext.close() from cleanup function. AudioContext now persists for entire app lifetime. Browser cleans it up when page closes.

**Fixed in:** v1.2.1

---

### Challenge 2: Filters Not Applying to Audio
**Problem:** Users adjusted filter sliders and used presets, but filters remained disabled. Visual overlay showed filtered regions, but audio played full spectrum.

**Root Cause:** `enabled: false` in filterSettings. Filters weren't auto-enabling when adjusted.

**Solution:** Added `enabled: true` to all filter adjustment handlers:
- handleHighPassChange
- handleLowPassChange
- All preset buttons

**Fixed in:** v1.2.2

---

### Challenge 3: Stop Button Not Working
**Problem:** Clicking Stop didn't stop audio playback.

**Root Cause:** sourceNodeRef.current was not being set properly, or stop() was being called on already-stopped sources.

**Solution:** Added comprehensive logging and proper error handling in stop() function. Ensured sourceNodeRef is set during play() and cleared during stop().

**Fixed in:** v1.2.1 (with debug logging in v1.2.1)

---

### Challenge 4: Rename Not Persisting
**Problem:** Renamed recordings reverted to original name after page reload.

**Root Cause:** setRecordings() only updated state, didn't call saveRecordingsToStorage(). Only addRecording() and removeRecording() were saving to localStorage.

**Solution:** Updated setRecordings() to call saveRecordingsToStorage() before updating state.

**Fixed in:** v1.2.3

---

### Challenge 5: Low-Frequency Noise Below Fundamental
**Problem:** When recording a 200 Hz tone, user could hear recognizable voice when filtering 100-175 Hz (below the fundamental). Visual data appeared below 100 Hz.

**Root Cause:** Microphone picking up room resonance, handling noise, and low-frequency rumble.

**Solution:** Added "Clean Below 125 Hz" preset that removes everything below 125 Hz with extreme brick-wall filtering. Combined with fundamental-specific presets (200/300/400 Hz).

**Fixed in:** v1.2.4

---

### Challenge 6: Recording Clipping/Distortion
**Problem:** Mac microphone was peaking and cutting off during recording.

**Root Cause:** Browser's automatic gain control (AGC) was causing distortion.

**Solution:**
```javascript
getUserMedia({
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,  // CRITICAL
    sampleRate: 48000
  }
})
// Plus 50% GainNode to reduce input level
```

**Fixed in:** Early development

---

### Challenge 7: Tab Navigation UX
**Problem:** Users selected recording in Recordings tab but couldn't see playback controls or spectrogram without manually switching tabs.

**Iterations:**
1. Originally auto-switched to Spectrum tab
2. Removed auto-switch (user request to stay on page)
3. Added back auto-switch after realizing playback was hidden

**Final Solution:** Clicking "Select" auto-switches to Spectrum tab where playback controls and visualization are visible.

**Fixed in:** v1.2.1

---

## Version History

### v1.2.4 (Current) - 2025-01-24
- Added "Clean Below 125 Hz" preset
- Replaced vocal presets with fundamental-specific presets (200/300/400 Hz)
- Helps eliminate background noise below voice fundamentals

### v1.2.3 - 2025-01-24
- Fixed rename not persisting to localStorage

### v1.2.2 - 2025-01-24
- Fixed filters not auto-enabling when using presets or sliders
- Full Range preset now properly disables filtering

### v1.2.1 - 2025-01-24
- Fixed AudioContext closing on tab navigation
- Fixed auto-switch to Spectrum tab when selecting recording
- Swapped Select and Rename button order

### v1.2.0 - 2025-01-24
- Added vocal range filter presets
- Implemented band sliding on spectrogram
- Renamed "Load" to "Select" with visual selection indicators
- Moved file upload to Recordings tab only
- Added version display and expandable changelog

### v1.1.0 - 2025-01-24
- Audio trimmer with waveform visualization
- Sample audio loader
- 4-tab navigation system
- Rename functionality
- About tab with project information

### v1.0.0 - 2025-01-24
- Initial release
- Extreme brick-wall filtering (16th-order)
- Real-time spectrogram visualization
- Audio recording from microphone
- Seamless audio looping
- File management (save/load/delete)
- Draggable filter controls
- Split audio path architecture
- Test tone generator
- localStorage persistence

## Development Workflow

### Branch Strategy
- **main** - Production branch (auto-deploys to Vercel)
- **DEVL** - Development branch
- Feature branches as needed

### Quality Gates
Every commit must pass:
1. ✅ ESLint (npm run lint) - Warnings OK, no errors
2. ✅ Build (npm run build) - Must compile successfully
3. ✅ Tests (npm test) - All 5 tests must pass

### Deployment
- **Vercel auto-deployment** from main branch
- Typical deploy time: 1-2 minutes
- URL: https://voice-spectrum.vercel.app

### JIRA Integration
- Project: VOICE
- All work tracked in tickets (VOICE-1 through VOICE-8)
- Autonomous development model
- Tickets updated via .ybotbot/jira-tools/ bash scripts

## Use Cases

1. **Voice Analysis** - Study vocal characteristics, pitch, and formants
2. **Music Education** - Visualize harmonics and overtone series
3. **Instrument Timbre** - Analyze frequency content of different instruments
4. **Filter Testing** - Verify extreme filter performance with test tones
5. **Acoustic Research** - Measure and analyze sound in frequency domain
6. **Physics Education** - Demonstrate Fourier analysis and wave superposition

## Known Limitations

1. **Browser Support** - Requires modern browsers with Web Audio API support
2. **No Server-Side Processing** - All processing is client-side
3. **Recording Storage** - Limited by localStorage (typically 5-10MB)
4. **No Persistence Across Devices** - Recordings stored locally only
5. **Microphone Permissions** - Requires user to grant microphone access
6. **Sample Files Not Included** - Public folder needs manual audio file addition

## Future Considerations

1. Export spectrogram as image/video
2. Real-time frequency tracking (pitch detection)
3. Multiple simultaneous recordings comparison
4. Export filter settings as presets
5. MIDI note display overlay on spectrogram
6. Frequency cursor with real-time Hz readout
7. Phase visualization
8. Harmonic series overlay guides
9. Cloud storage integration
10. Mobile app version

## File Structure

```
voice/
├── public/
│   ├── index.html
│   └── README_SAMPLE_AUDIO.md
├── src/
│   ├── components/
│   │   ├── AudioPlayback.tsx
│   │   ├── AudioRecorder.tsx
│   │   ├── AudioTrimmer.tsx
│   │   ├── DeviceInfo.tsx
│   │   ├── FileUploader.tsx
│   │   ├── FilterControls.tsx
│   │   ├── RecordingsList.tsx
│   │   ├── SampleAudioLoader.tsx
│   │   ├── Spectrogram.tsx
│   │   ├── TabNavigation.tsx
│   │   └── TestToneGenerator.tsx
│   ├── hooks/
│   │   ├── useAudioContext.ts
│   │   ├── useAudioPlayback.ts
│   │   ├── useAudioRecorder.ts
│   │   └── useLoadRecordings.ts
│   ├── store/
│   │   └── audioStore.ts
│   ├── types/
│   │   └── audio.ts
│   ├── utils/
│   │   ├── audioProcessing.ts
│   │   └── localStorage.ts
│   ├── version.ts
│   ├── App.tsx
│   └── setupTests.ts
├── .ybotbot/
│   └── jira-tools/ (JIRA CLI scripts)
├── CLAUDE.md (Project configuration for Claude Code)
├── PROJECT_SUMMARY.md (This file)
├── VERCEL_SETUP.md
└── package.json
```

## Testing

- **Unit Tests:** 5 tests covering core functionality
- **Component Tests:** App rendering, tab navigation
- **Integration Tests:** Web Audio API mocks in setupTests.ts
- **Manual Testing:** Required for audio playback verification

## Performance Metrics

- **Build Size (gzipped):**
  - main.js: ~76 KB
  - main.css: ~4 KB
  - Total: ~80 KB
- **FFT Resolution:** 5.86 Hz/bin at 48kHz (8192-point FFT)
- **Filter Latency:** < 10ms (Web Audio API optimization)
- **Animation:** 60 FPS spectrogram rendering

## Key Learnings

1. **AudioContext Lifecycle** - Must persist across component lifecycles in SPA
2. **Web Audio Graph** - Split paths allow different processing for visualization vs playback
3. **Filter Design** - 16th-order cascaded filters achieve near brick-wall response
4. **State Management** - Zustand + localStorage provides simple persistence
5. **User Feedback** - Visual indicators crucial (selection state, filter status)
6. **Debug Logging** - Console logs essential for diagnosing audio issues
7. **Preset Design** - Auto-enabling filters improves UX significantly
8. **Low-Frequency Noise** - Common issue requiring dedicated cleanup presets

---

**This application successfully demonstrates that complex sounds are fundamentally composed of simple sine waves, making Fourier analysis tangible and interactive for users.**
