import { useState } from 'react';
import { useAudioContext } from '../hooks/useAudioContext';
import { useAudioStore } from '../store/audioStore';
import { audioBufferToWav } from '../utils/audioProcessing';

/**
 * Test Tone Generator - Create pure sine waves with harmonics for testing filters
 * Now includes "Save as Recording" to test tones through the filter chain
 */
export const TestToneGenerator = () => {
  const { audioContext } = useAudioContext();
  const { addRecording, setActiveTab } = useAudioStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fundamental, setFundamental] = useState(200);
  const [includeHarmonics, setIncludeHarmonics] = useState(false);
  const [duration, setDuration] = useState(3);
  const [oscillators, setOscillators] = useState<OscillatorNode[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const startTestTone = () => {
    if (!audioContext) return;

    const newOscillators: OscillatorNode[] = [];
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1; // Quiet to prevent ear damage
    gainNode.connect(audioContext.destination);

    // Fundamental frequency
    const osc1 = audioContext.createOscillator();
    osc1.frequency.value = fundamental;
    osc1.type = 'sine';
    osc1.connect(gainNode);
    osc1.start();
    newOscillators.push(osc1);

    if (includeHarmonics) {
      // 2nd harmonic (octave)
      const osc2 = audioContext.createOscillator();
      osc2.frequency.value = fundamental * 2;
      osc2.type = 'sine';
      const gain2 = audioContext.createGain();
      gain2.gain.value = 0.5; // Half volume
      osc2.connect(gain2);
      gain2.connect(gainNode);
      osc2.start();
      newOscillators.push(osc2);

      // 3rd harmonic
      const osc3 = audioContext.createOscillator();
      osc3.frequency.value = fundamental * 3;
      osc3.type = 'sine';
      const gain3 = audioContext.createGain();
      gain3.gain.value = 0.33;
      osc3.connect(gain3);
      gain3.connect(gainNode);
      osc3.start();
      newOscillators.push(osc3);

      // 4th harmonic
      const osc4 = audioContext.createOscillator();
      osc4.frequency.value = fundamental * 4;
      osc4.type = 'sine';
      const gain4 = audioContext.createGain();
      gain4.gain.value = 0.25;
      osc4.connect(gain4);
      gain4.connect(gainNode);
      osc4.start();
      newOscillators.push(osc4);

      console.log('Test tone started:', fundamental, 'Hz with harmonics:', [
        fundamental, fundamental * 2, fundamental * 3, fundamental * 4
      ].join(', '), 'Hz');
    } else {
      console.log('Pure sine wave started:', fundamental, 'Hz (no harmonics)');
    }

    setOscillators(newOscillators);
    setIsPlaying(true);
  };

  const stopTestTone = () => {
    oscillators.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    setOscillators([]);
    setIsPlaying(false);
    console.log('Test tone stopped');
  };

  /**
   * Generate a test tone and save it as a recording
   * This allows testing the tone through the filter chain
   */
  const saveAsRecording = async () => {
    if (!audioContext) return;

    setIsSaving(true);

    try {
      const sampleRate = audioContext.sampleRate;
      const numSamples = Math.floor(sampleRate * duration);

      // Create an offline audio context for rendering
      const offlineCtx = new OfflineAudioContext(1, numSamples, sampleRate);

      // Create oscillator for fundamental
      const osc1 = offlineCtx.createOscillator();
      osc1.frequency.value = fundamental;
      osc1.type = 'sine';

      const masterGain = offlineCtx.createGain();
      masterGain.gain.value = 0.5; // Prevent clipping
      masterGain.connect(offlineCtx.destination);

      osc1.connect(masterGain);
      osc1.start(0);
      osc1.stop(duration);

      if (includeHarmonics) {
        // 2nd harmonic
        const osc2 = offlineCtx.createOscillator();
        osc2.frequency.value = fundamental * 2;
        osc2.type = 'sine';
        const gain2 = offlineCtx.createGain();
        gain2.gain.value = 0.25;
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start(0);
        osc2.stop(duration);

        // 3rd harmonic
        const osc3 = offlineCtx.createOscillator();
        osc3.frequency.value = fundamental * 3;
        osc3.type = 'sine';
        const gain3 = offlineCtx.createGain();
        gain3.gain.value = 0.167;
        osc3.connect(gain3);
        gain3.connect(masterGain);
        osc3.start(0);
        osc3.stop(duration);

        // 4th harmonic
        const osc4 = offlineCtx.createOscillator();
        osc4.frequency.value = fundamental * 4;
        osc4.type = 'sine';
        const gain4 = offlineCtx.createGain();
        gain4.gain.value = 0.125;
        osc4.connect(gain4);
        gain4.connect(masterGain);
        osc4.start(0);
        osc4.stop(duration);
      }

      // Render the audio
      const renderedBuffer = await offlineCtx.startRendering();

      // Convert to WAV blob
      const wavBlob = audioBufferToWav(renderedBuffer);

      // Create recording object
      const harmonicsLabel = includeHarmonics ? ' +harmonics' : ' pure';
      const recording = {
        id: `test-tone-${Date.now()}`,
        name: `Test ${fundamental}Hz${harmonicsLabel}`,
        blob: wavBlob,
        duration: duration,
        createdAt: new Date()
      };

      // Add to recordings
      addRecording(recording);

      // Switch to recordings tab
      setActiveTab('recordings');

      console.log(`Saved test tone: ${fundamental}Hz, ${duration}s, harmonics: ${includeHarmonics}`);
    } catch (error) {
      console.error('Failed to save test tone:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-gray-800 mb-3">Test Tone Generator</h3>
      <p className="text-xs text-gray-600 mb-3">
        Generate pure test tones to verify filter behavior. Save as recording to test through filter chain.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Fundamental Frequency: {fundamental} Hz
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={fundamental}
            onChange={(e) => setFundamental(Number(e.target.value))}
            disabled={isPlaying || isSaving}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Duration: {duration} seconds
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={isPlaying || isSaving}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="harmonics"
            checked={includeHarmonics}
            onChange={(e) => setIncludeHarmonics(e.target.checked)}
            disabled={isPlaying || isSaving}
            className="w-4 h-4"
          />
          <label htmlFor="harmonics" className="text-sm">
            Include harmonics (2x, 3x, 4x)
          </label>
        </div>

        {includeHarmonics && (
          <div className="text-xs text-gray-600 bg-white p-2 rounded">
            Will generate: {fundamental}Hz (fund), {fundamental * 2}Hz (2nd), {fundamental * 3}Hz (3rd), {fundamental * 4}Hz (4th)
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {!isPlaying ? (
            <button
              onClick={startTestTone}
              disabled={!audioContext || isSaving}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-300"
            >
              Play Preview
            </button>
          ) : (
            <button
              onClick={stopTestTone}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Stop
            </button>
          )}

          <button
            onClick={saveAsRecording}
            disabled={!audioContext || isPlaying || isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-300"
          >
            {isSaving ? 'Saving...' : 'Save as Recording'}
          </button>
        </div>

        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <strong>Filter Test:</strong> Save a 200Hz pure tone, then filter to 150-250Hz.
          If you hear ONLY a pure sine wave, the filter works. If you hear harmonics, there's a bug.
        </div>
      </div>
    </div>
  );
};
