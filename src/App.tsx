import { AudioRecorder } from './components/AudioRecorder';
import { AudioPlayback } from './components/AudioPlayback';
import { RecordingsList } from './components/RecordingsList';
import { FilterControls } from './components/FilterControls';
import { useAudioContext } from './hooks/useAudioContext';

function App() {
  // Initialize audio context
  useAudioContext();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">Voice Spectrum Analyzer</h1>
          <p className="text-blue-100 mt-2">Real-time audio frequency visualization and filtering</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Recording and Playback */}
          <div>
            <AudioRecorder />
            <AudioPlayback />
            <RecordingsList />
          </div>

          {/* Right Column - Filters and Visualization */}
          <div>
            <FilterControls />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Spectrogram Visualization</h2>
              <div className="bg-gray-200 rounded h-96 flex items-center justify-center">
                <p className="text-gray-600">Spectrogram visualization coming in VOICE-3</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-gray-400">Voice Spectrum Analyzer • Built with React, TypeScript, and Web Audio API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
