import { useState } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { AudioRecording } from '../types/audio';
import { useAudioContext } from '../hooks/useAudioContext';
import { downloadAudio } from '../utils/audioProcessing';

export const RecordingsList = () => {
  const { recordings, removeRecording, currentRecording, selectedRecording, setSelectedRecording } = useAudioStore();
  const { loadAudio } = useAudioPlayback();
  const { audioContext } = useAudioContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSelect = async (recording: AudioRecording) => {
    console.log('Selecting recording:', recording.name, 'Blob size:', recording.blob.size, 'bytes');
    setSelectedRecording(recording);
    await loadAudio(recording);
    // Don't auto-switch tabs - let user stay on Recordings tab
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

  const handleRenameStart = (recording: AudioRecording) => {
    setEditingId(recording.id);
    setEditName(recording.name);
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleRenameSave = (recording: AudioRecording) => {
    if (editName.trim()) {
      const updatedRecording = { ...recording, name: editName.trim() };
      // Update the recording in the store
      const updatedRecordings = recordings.map(r =>
        r.id === recording.id ? updatedRecording : r
      );
      const { setRecordings } = useAudioStore.getState();
      setRecordings(updatedRecordings);

      // If this is the current recording, update it too
      if (currentRecording?.id === recording.id) {
        const { setCurrentRecording } = useAudioStore.getState();
        setCurrentRecording(updatedRecording);
      }

      // If this is the selected recording, update it
      const { selectedRecording } = useAudioStore.getState();
      if (selectedRecording?.id === recording.id) {
        setSelectedRecording(updatedRecording);
      }
    }
    setEditingId(null);
    setEditName('');
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
        {allRecordings.map((recording) => {
          const isSelected = selectedRecording?.id === recording.id;
          return (
          <div
            key={recording.id}
            className={`flex items-center justify-between p-3 rounded transition ${
              isSelected
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex-1">
              {editingId === recording.id ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSave(recording);
                      if (e.key === 'Escape') handleRenameCancel();
                    }}
                  />
                  <button
                    onClick={() => handleRenameSave(recording)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleRenameCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{recording.name}</p>
                    {isSelected && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {recording.duration.toFixed(2)}s • {(recording.blob.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-gray-500">
                    {recording.createdAt.toLocaleString()}
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2">{editingId !== recording.id && (
              <>
                <button
                  onClick={() => handleRenameStart(recording)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition"
                  title="Rename this recording"
                >
                  Rename
                </button>
              <button
                onClick={() => handleSelect(recording)}
                className={`px-4 py-2 rounded text-sm transition ${
                  isSelected
                    ? 'bg-blue-700 hover:bg-blue-800 text-white font-bold'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                title="Select this recording for playback in Spectrum tab"
              >
                {isSelected ? '✓ Selected' : 'Select'}
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
              </>
            )}</div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
