import { AudioRecorder } from './components/AudioRecorder';
import { AudioPlayback } from './components/AudioPlayback';
import { RecordingsList } from './components/RecordingsList';
import { FilterControls } from './components/FilterControls';
import { Spectrogram } from './components/Spectrogram';
import { DeviceInfo } from './components/DeviceInfo';
import { TestToneGenerator } from './components/TestToneGenerator';
import { TabNavigation } from './components/TabNavigation';
import { useAudioContext } from './hooks/useAudioContext';
import { useLoadRecordings } from './hooks/useLoadRecordings';

function App() {
  // Initialize audio context
  useAudioContext();

  // Load saved recordings from localStorage
  const { isLoading } = useLoadRecordings();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">Voice Spectrum Analyzer</h1>
          <p className="text-blue-100 mt-2">Real-time audio frequency visualization and filtering</p>
        </div>
      </header>

      {isLoading && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            Loading saved recordings...
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <TabNavigation>
          {(activeTab) => (
            <>
              {/* Tab 1: Spectrum Visualization */}
              {activeTab === 'spectrum' && (
                <div className="space-y-6">
                  <FilterControls />
                  <AudioPlayback />
                  <Spectrogram />
                </div>
              )}

              {/* Tab 2: Recordings */}
              {activeTab === 'recordings' && (
                <div className="space-y-6">
                  <AudioRecorder />
                  <RecordingsList />
                </div>
              )}

              {/* Tab 3: Config/Test */}
              {activeTab === 'config' && (
                <div className="space-y-6">
                  <DeviceInfo />
                  <TestToneGenerator />
                </div>
              )}
            </>
          )}
        </TabNavigation>
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
