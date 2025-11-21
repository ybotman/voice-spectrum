# Sample Audio Files

This folder should contain sample audio files for spectrum analysis and testing.

## Required Sample Files

The application expects the following sample audio files to be present in this `/public` folder:

1. **test-tone-100hz.wav**
   - Pure 100Hz sine wave
   - Duration: 5-10 seconds
   - Used for testing low-frequency filter isolation

2. **test-tone-440hz.wav**
   - Pure 440Hz sine wave (musical note A4)
   - Duration: 5-10 seconds
   - Used for testing mid-frequency filter performance

3. **voice-sample.wav**
   - Single sustained vocal note
   - Should be a clean recording of someone singing or humming a single pitch
   - Duration: 5-10 seconds
   - Used for harmonic analysis and voice spectrum testing

## Creating Sample Audio Files

### Option 1: Use TestToneGenerator (Built-in)
The application includes a TestToneGenerator in the "Config/Test" tab that can generate test tones. However, you'll need to:
1. Generate the tone in the app
2. Download it using the recording controls
3. Manually rename and place it in this folder

### Option 2: Use External Audio Tools

**Audacity (Free, Cross-platform)**:
1. Download Audacity from https://www.audacityteam.org/
2. For test tones:
   - Generate → Tone → Sine Wave
   - Set frequency (100 or 440 Hz)
   - Set duration (5-10 seconds)
   - Set amplitude (0.5 or less to avoid clipping)
   - File → Export → Export as WAV
3. For voice samples:
   - Record a sustained single note (hum or sing "ahhh")
   - Trim to 5-10 seconds of clean audio
   - Apply Normalize effect if needed
   - File → Export → Export as WAV

**macOS Terminal (Built-in)**:
```bash
# Generate 100Hz tone (10 seconds)
sox -n -r 48000 -b 16 test-tone-100hz.wav synth 10 sine 100

# Generate 440Hz tone (10 seconds)
sox -n -r 48000 -b 16 test-tone-440hz.wav synth 10 sine 440
```
(Requires `sox` to be installed: `brew install sox`)

**Python with scipy**:
```python
import numpy as np
from scipy.io import wavfile

# Generate 100Hz sine wave
sample_rate = 48000
duration = 10
frequency = 100

t = np.linspace(0, duration, sample_rate * duration)
audio = np.sin(2 * np.pi * frequency * t) * 0.5
audio = (audio * 32767).astype(np.int16)

wavfile.write('test-tone-100hz.wav', sample_rate, audio)
```

## File Specifications

All sample audio files should meet these specifications:
- **Format**: WAV (uncompressed)
- **Sample Rate**: 48000 Hz (preferred) or 44100 Hz
- **Bit Depth**: 16-bit
- **Channels**: Mono (1 channel)
- **Duration**: 5-10 seconds
- **Amplitude**: -6dB peak or lower (to avoid clipping)

## Testing Sample Files

After placing files in this folder:
1. Restart the development server (`npm start`)
2. Open the application
3. Navigate to the "Recordings" tab
4. Look for the "Sample Audio Files" section
5. Click "Load" on any sample
6. Go to the "Spectrum" tab and click "Play" to verify

## Troubleshooting

**"Sample audio file not found" error**:
- Verify the file is in `/public` folder (not a subdirectory)
- Check the filename exactly matches (case-sensitive)
- Ensure the file extension is `.wav`
- Try refreshing the browser with Ctrl+Shift+R (hard refresh)

**Audio loads but sounds wrong**:
- Check sample rate is 48000 Hz or 44100 Hz
- Verify format is WAV (not MP3 or other compressed format)
- Ensure file is not corrupted

**No sound when playing**:
- Check volume levels in browser and system
- Try the TestToneGenerator in Config/Test tab to verify audio output
- Check browser console (F12) for errors
