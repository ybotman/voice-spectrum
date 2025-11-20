import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordingState } from '../types/audio';

export const AudioRecorder = () => {
  const {
    recordingState,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  } = useAudioRecorder();

  const isRecording = recordingState === RecordingState.RECORDING;
  const isPaused = recordingState === RecordingState.PAUSED;
  const isIdle = recordingState === RecordingState.IDLE;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Audio Recorder</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {isIdle && (
          <button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition"
          >
            ● Start Recording
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={pauseRecording}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded transition"
            >
              ⏸ Pause
            </button>
            <button
              onClick={stopRecording}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded transition"
            >
              ⏹ Stop
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeRecording}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition"
            >
              ▶ Resume
            </button>
            <button
              onClick={stopRecording}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded transition"
            >
              ⏹ Stop
            </button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">Recording in progress...</span>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="mt-4 text-yellow-600">
          Recording paused
        </div>
      )}
    </div>
  );
};
