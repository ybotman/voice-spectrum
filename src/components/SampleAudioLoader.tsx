import { useAudioContext } from '../hooks/useAudioContext';
import { useAudioStore } from '../store/audioStore';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { AudioRecording } from '../types/audio';

interface SampleAudio {
  name: string;
  filename: string;
  description: string;
}

const SAMPLE_AUDIO_FILES: SampleAudio[] = [
  {
    name: 'Test Tone 100Hz',
    filename: 'test-tone-100hz.wav',
    description: 'Pure 100Hz sine wave for filter testing'
  },
  {
    name: 'Test Tone 440Hz (A4)',
    filename: 'test-tone-440hz.wav',
    description: 'Pure 440Hz sine wave (musical note A4)'
  },
  {
    name: 'Voice Sample',
    filename: 'voice-sample.wav',
    description: 'Single sustained vocal note for analysis'
  }
];

export const SampleAudioLoader = () => {
  const { audioContext } = useAudioContext();
  const { setSelectedRecording, addRecording } = useAudioStore();
  const { loadAudio } = useAudioPlayback();

  const handleLoadSample = async (sample: SampleAudio) => {
    if (!audioContext) {
      alert('Audio context not initialized. Please wait and try again.');
      return;
    }

    try {
      console.log('Loading sample audio:', sample.filename);

      // Fetch the audio file from public folder
      const response = await fetch(`/${sample.filename}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${sample.filename}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Convert to Blob for storage
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });

      // Create recording object
      const recording: AudioRecording = {
        id: `sample-${Date.now()}`,
        name: sample.name,
        blob: blob,
        duration: audioBuffer.duration,
        createdAt: new Date()
      };

      console.log('Sample loaded:', sample.name, audioBuffer.duration, 'seconds');

      // Add to recordings list and select it
      addRecording(recording);
      setSelectedRecording(recording);
      await loadAudio(recording);

      console.log('Sample ready for playback');
    } catch (err) {
      console.error('Failed to load sample audio:', err);

      // Provide helpful error message
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        alert(
          `Sample audio file not found: ${sample.filename}\n\n` +
          `To use sample audio:\n` +
          `1. Place audio files in the /public folder\n` +
          `2. Ensure filenames match: ${sample.filename}\n` +
          `3. Refresh the page and try again`
        );
      } else {
        alert(`Failed to load sample: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Sample Audio Files</h3>

      <p className="text-sm text-gray-600 mb-4">
        Load pre-configured test audio files for spectrum analysis and filter testing.
      </p>

      <div className="space-y-3">
        {SAMPLE_AUDIO_FILES.map((sample) => (
          <div
            key={sample.filename}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition"
          >
            <div className="flex-1">
              <p className="font-semibold">{sample.name}</p>
              <p className="text-xs text-gray-600">{sample.description}</p>
              <p className="text-xs text-gray-500 italic">File: {sample.filename}</p>
            </div>

            <button
              onClick={() => handleLoadSample(sample)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
              title={`Load ${sample.name}`}
            >
              Load
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Sample audio files must be placed in the <code className="bg-gray-200 px-1 rounded">/public</code> folder.
          If files are missing, you'll see an error message with instructions.
        </p>
      </div>
    </div>
  );
};
