import { useAudioStore } from '../store/audioStore';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { AudioRecording } from '../types/audio';
import { useAudioContext } from '../hooks/useAudioContext';
import { downloadAudio } from '../utils/audioProcessing';

export const RecordingsList = () => {
  const { recordings, removeRecording, currentRecording, setSelectedRecording } = useAudioStore();
  const { loadAudio } = useAudioPlayback();
  const { audioContext } = useAudioContext();

  const handleSelect = async (recording: AudioRecording) => {
    console.log('Loading recording:', recording.name, 'Blob size:', recording.blob.size, 'bytes');
    setSelectedRecording(recording);
    await loadAudio(recording);
  };

  const handleDownload = async (recording: AudioRecording) => {
    try {
      if (!audioContext) {
        console.error('Audio context not initialized');
        alert('Audio context not ready. Please wait and try again.');
        return;
      }

      console.log('Downloading recording:', recording.name, 'Blob size:', recording.blob.size, 'bytes');

      // Convert blob to audio buffer
      const arrayBuffer = await recording.blob.arrayBuffer();
      console.log('ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Audio decoded for download:', audioBuffer.duration, 'seconds');

      // Download as WAV
      downloadAudio(audioBuffer, `${recording.name}.wav`);
      console.log('Download initiated');
    } catch (err) {
      console.error('Failed to download recording:', err);
      alert(`Failed to download: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      removeRecording(id);
    }
  };

  const allRecordings = currentRecording
    ? [currentRecording, ...recordings.filter(r => r.id !== currentRecording.id)]
    : recordings;

  if (allRecordings.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recordings</h2>
        <p className="text-gray-600">No recordings yet. Start recording to create your first audio sample.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Recordings</h2>

      <div className="space-y-2">
        {allRecordings.map((recording) => (
          <div
            key={recording.id}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition"
          >
            <div className="flex-1">
              <p className="font-semibold">{recording.name}</p>
              <p className="text-sm text-gray-600">
                {recording.duration.toFixed(2)}s • {(recording.blob.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-gray-500">
                {recording.createdAt.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSelect(recording)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                title="Load this recording for playback"
              >
                Load
              </button>
              <button
                onClick={() => handleDownload(recording)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition"
                title="Download as WAV file to your Downloads folder"
              >
                Save
              </button>
              <button
                onClick={() => handleDelete(recording.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition"
                title="Delete this recording permanently"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
