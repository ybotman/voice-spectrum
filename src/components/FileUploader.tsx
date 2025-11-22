import { useAudioStore } from '../store/audioStore';
import { useAudioContext } from '../hooks/useAudioContext';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { AudioRecording } from '../types/audio';
import { loadAudioFile } from '../utils/audioProcessing';

export const FileUploader = () => {
  const { audioContext } = useAudioContext();
  const { addRecording, setSelectedRecording } = useAudioStore();
  const { loadAudio } = useAudioPlayback();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !audioContext) return;

    try {
      console.log('Uploading audio file:', file.name, 'Size:', file.size, 'bytes');
      const audioBuffer = await loadAudioFile(file, audioContext);

      // Create a new recording from the uploaded file
      const recording: AudioRecording = {
        id: `upload-${Date.now()}`,
        name: file.name,
        blob: file,
        duration: audioBuffer.duration,
        createdAt: new Date()
      };

      addRecording(recording);
      setSelectedRecording(recording);
      await loadAudio(recording);

      console.log('File uploaded and selected successfully:', audioBuffer.duration, 'seconds');
    } catch (err) {
      console.error('Failed to upload audio file:', err);
      alert('Failed to upload audio file. Please try a different file.');
    }

    // Reset the input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Upload Audio File</h3>

      <p className="text-sm text-gray-600 mb-4">
        Upload an audio file from your device (WAV, MP3, etc.)
      </p>

      <label className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded cursor-pointer transition">
        📁 Upload Audio File
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      <p className="text-xs text-gray-500 mt-3">
        Supported formats: WAV, MP3, OGG, and other browser-compatible audio formats
      </p>
    </div>
  );
};
