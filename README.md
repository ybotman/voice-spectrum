# Voice Spectrum Analyzer

Audio spectrum analyzer with real-time frequency filtering and visualization.

## Project Vision

A web-based audio tool that allows you to:

1. **Record or Load Audio**
   - Record from local microphone
   - Load pre-recorded audio files from a public folder
   - Support for simple single-note sustained sounds

2. **Continuous Playback & Looping**
   - Loop audio continuously for sustained analysis
   - Real-time playback control

3. **Real-Time Spectrum Visualization**
   - **Y-axis**: Frequency (0 Hz - 20,000 Hz) - Low to High
   - **X-axis**: Time (continuous scrolling)
   - Visual representation of audio spectrum as it plays

4. **Frequency Band Filtering**
   - Interactive band-pass filter controls
   - Narrow listening range to specific frequency bands (e.g., 200 Hz range)
   - Filter output to focus on vocal spectrum, horn spectrum, or custom ranges
   - Filtered audio plays through local speakers
   - Adjustable frequency range: 0-20,000 Hz with customizable band width

## Use Cases

- Isolate specific frequency ranges in complex audio
- Analyze vocal formants and harmonics
- Study instrument frequency characteristics
- Educational tool for understanding sound and frequencies
- Audio engineering and sound design

## Technology Stack

- **Frontend**: React (for web and mobile compatibility)
- **Audio Processing**: Web Audio API
- **Visualization**: Canvas API or visualization library
- **Alternative**: Python-based implementation possible

## Getting Started

_Coming soon - project initialization in progress_

## Repository

https://github.com/ybotman/voice-spectrum
