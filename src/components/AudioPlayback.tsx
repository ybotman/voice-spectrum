import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useAudioStore } from '../store/audioStore';
import { PlaybackState } from '../types/audio';

export const AudioPlayback = () => {
  const {
    playbackState,
    currentAudioBuffer,
    play,
    stop,
    pause,
    resume
  } = useAudioPlayback();

  const { selectedRecording, loopEnabled, setLoopEnabled } = useAudioStore();

  const isPlaying = playbackState === PlaybackState.PLAYING;
  const isPaused = playbackState === PlaybackState.PAUSED;
  const hasAudio = currentAudioBuffer !== null;

  const toggleLoop = () => {
    setLoopEnabled(!loopEnabled);
    console.log('Loop toggled:', !loopEnabled ? 'ON' : 'OFF');
  };

  if (!selectedRecording && !hasAudio) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Audio Playback</h2>
        <p className="text-gray-600">No audio selected. Go to the Recordings tab to record, upload, or select audio.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Audio Playback</h2>

      {selectedRecording && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="font-semibold">{selectedRecording.name}</p>
          <p className="text-sm text-gray-600">
            Duration: {selectedRecording.duration.toFixed(2)}s
          </p>
        </div>
      )}

      <div className="mb-4 flex gap-3 items-center">
        <button
          onClick={toggleLoop}
          className={`${
            loopEnabled
              ? 'bg-purple-500 hover:bg-purple-600'
              : 'bg-gray-500 hover:bg-gray-600'
          } text-white font-bold py-2 px-4 rounded transition text-sm`}
        >
          {loopEnabled ? '🔁 Loop: ON' : '▶️ Play Once'}
        </button>

        <span className="text-xs text-gray-500">
          {loopEnabled ? 'Continuous playback' : 'Single playback'}
        </span>
      </div>

      <div className="flex gap-3">
        {!isPlaying && !isPaused && (
          <button
            onClick={play}
            disabled={!hasAudio}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded transition"
          >
            {loopEnabled ? '▶ Play (Loop)' : '▶ Play Once'}
          </button>
        )}

        {isPlaying && (
          <>
            <button
              onClick={pause}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded transition"
            >
              ⏸ Pause
            </button>
            <button
              onClick={stop}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded transition"
            >
              ⏹ Stop
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resume}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition"
            >
              ▶ Resume
            </button>
            <button
              onClick={stop}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded transition"
            >
              ⏹ Stop
            </button>
          </>
        )}
      </div>

      {isPlaying && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">
              {loopEnabled ? 'Playing (looping continuously)...' : 'Playing once...'}
            </span>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="mt-4 text-yellow-600">
          Playback paused
        </div>
      )}
    </div>
  );
};
