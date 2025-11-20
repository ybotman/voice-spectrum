# Voice Spectrum - Application Requirements

## Core Features

### 1. Audio Recording & Processing

#### Recording
- Record audio from microphone
- Ability to trim start/end of recording
- Define start point and end point for usable audio section

#### Looping Strategy
Two options for continuous playback:
- **Option A**: Loop original 5-second clip repeatedly (cache considerations?)
- **Option B**: Pre-generate 30-second looped buffer from 5-second clip (store in memory)

**Decision Needed**: Which approach for performance and memory efficiency?

#### Storage
- Save trimmed/processed audio to `/public` folder
- Allow loading of previously saved audio files
- Support standard audio formats (WAV, MP3)

### 2. Audio Selection & Playback
- Browse and select audio files from public folder
- Start/stop/pause playback controls
- Continuous looping during playback
- Real-time audio output to speakers

### 3. Spectrum Visualization

#### Display Format
- **Z-axis (horizontal)**: Time (scrolling continuously as audio plays)
- **Y-axis (vertical)**: Frequency (0-20,000 Hz)
- **Color intensity**: Magnitude/amplitude of frequency
  - Hotter colors = stronger frequency presence
  - Standard spectrogram color mapping

#### Frequency Scale Options
- **Linear scale**: Equal spacing (0, 1000, 2000, 3000... Hz)
- **Logarithmic scale**: Musical/perceptual spacing (better for seeing harmonics)

#### Visual Style
- Standard spectrogram representation
- "Hot spots" clearly visible for dominant frequencies
- Real-time updates as audio plays
- Scrolling time window to show frequency evolution

### 4. Frequency Band Filtering

#### Interactive Filter Controls
- **High-pass filter**: Set low frequency cutoff
- **Low-pass filter**: Set high frequency cutoff
- **Band-pass result**: Creates frequency band between high and low
- Filter is "inclusive" - only frequencies within band pass through

#### Filter Parameters
- Adjustable frequency range: 0-20,000 Hz
- Visual feedback showing active filter range on spectrogram
- Real-time audio filtering during playback
- Filtered audio plays through speakers

#### Use Cases
- Isolate vocal frequencies (200-3000 Hz)
- Isolate instrument ranges (e.g., trumpet: 200-1500 Hz)
- Study specific harmonic bands
- Remove unwanted frequency ranges

## Technical Considerations

### Performance
- Real-time FFT (Fast Fourier Transform) analysis
- Canvas rendering for smooth spectrogram updates
- Efficient audio buffer management for looping
- Web Audio API: AnalyserNode + BiquadFilterNode

### Memory Management
- Decide on loop caching strategy (5s vs 30s buffer)
- Efficient Canvas updates (only redraw changed regions?)
- Audio buffer size optimization

### User Experience
- Smooth, responsive controls
- Clear visual feedback for all operations
- Intuitive filter adjustment (sliders? drag handles on spectrogram?)
- Save/load state for repeated analysis sessions

## Questions for Clarification

1. **Looping Strategy**:
   - Cache and repeat 5-second clip? (lighter memory, possible audio gap)
   - Pre-generate 30-second looped buffer? (heavier memory, seamless playback)

2. **Recording Length**:
   - Maximum recording duration?
   - Recommended clip length for analysis?

3. **Trimming UI**:
   - Waveform view with drag handles?
   - Numeric input for start/end times?
   - Play selection before confirming trim?

4. **Filter UI**:
   - Dual sliders for high/low cutoff?
   - Drag regions directly on spectrogram?
   - Numeric input fields?
   - Preset bands (vocal, bass, treble, etc.)?

5. **Color Scheme**:
   - Standard "hot" color map (black → red → yellow → white)?
   - Alternative schemes (blue → red, grayscale)?
   - User selectable?

## Next Steps

1. Create JIRA epic for core audio features
2. Break down into individual tickets:
   - Audio recording + microphone access
   - Trim/edit interface
   - Audio looping system
   - Spectrogram visualization
   - Band-pass filter controls
   - Save/load audio files
3. Start with foundational Web Audio API integration
