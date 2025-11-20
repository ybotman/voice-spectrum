import { useAudioStore } from '../store/audioStore';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { AudioRecording } from '../types/audio';
import { useAudioContext } from '../hooks/useAudioContext';
import { downloadAudio } from '../utils/audioProcessing';

export const RecordingsList = () => {
  const { recordings, removeRecording, currentRecording, setSelectedRecording } = useAudioStore();
  const { loadAudio, currentAudioBuffer } = useAudioPlayback();
  const { audioContext } = useAudioContext();

  const handleSelect = async (recording: AudioRecording) => {
    setSelectedRecording(recording);
    await loadAudio(recording);
  };

  const handleDownload = (recording: AudioRecording) => {
    if (currentAudioBuffer && audioContext) {
      downloadAudio(currentAudioBuffer, `${recording.name}.wav`);
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
                {recording.duration.toFixed(2)}s • {recording.createdAt.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSelect(recording)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
              >
                Load
              </button>
              <button
                onClick={() => handleDownload(recording)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition"
                disabled={!currentAudioBuffer}
              >
                Save
              </button>
              <button
                onClick={() => handleDelete(recording.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition"
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
