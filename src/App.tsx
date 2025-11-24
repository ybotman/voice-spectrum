import { AudioRecorder } from './components/AudioRecorder';
import { AudioPlayback } from './components/AudioPlayback';
import { RecordingsList } from './components/RecordingsList';
import { SampleAudioLoader } from './components/SampleAudioLoader';
import { FileUploader } from './components/FileUploader';
import { AudioTrimmer } from './components/AudioTrimmer';
import { FilterControls } from './components/FilterControls';
import { Spectrogram } from './components/Spectrogram';
import { DeviceInfo } from './components/DeviceInfo';
import { TestToneGenerator } from './components/TestToneGenerator';
import { TabNavigation } from './components/TabNavigation';
import { useAudioContext } from './hooks/useAudioContext';
import { useLoadRecordings } from './hooks/useLoadRecordings';
import { APP_VERSION, CHANGELOG } from './version';
import { useState } from 'react';

function App() {
  // Initialize audio context
  useAudioContext();

  // Load saved recordings from localStorage
  const { isLoading } = useLoadRecordings();

  // Changelog expansion state
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([CHANGELOG[0].version]));

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Voice Spectrum Analyzer</h1>
              <p className="text-blue-100 mt-2">Demonstrating that all sounds are composed of simple sine waves</p>
            </div>
            <div className="text-right">
              <span className="text-blue-200 text-sm">Version</span>
              <p className="text-2xl font-bold">{APP_VERSION}</p>
            </div>
          </div>
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
                  <FileUploader />
                  <SampleAudioLoader />
                  <AudioTrimmer />
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

              {/* Tab 4: About */}
              {activeTab === 'about' && (
                <div className="prose max-w-none">
                  <h2 className="text-3xl font-bold mb-6">About Voice Spectrum Analyzer</h2>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                    <h3 className="text-xl font-bold mb-2">Created by Toby Balsley</h3>
                    <p className="text-gray-700">HDTS LLC • 2025</p>
                  </div>

                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">🎯 Core Mission</h3>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 p-6 rounded-lg">
                      <p className="text-lg text-gray-800 leading-relaxed">
                        This application demonstrates the fundamental principle that <strong>all sounds—voice, instruments, environmental noise—are composed entirely of simple sinusoidal waves at different frequencies</strong>. By isolating narrow frequency bands with extreme precision filters, you can hear individual sine wave components that combine to create what we perceive as complex sounds. When you filter to just 75-125 Hz and hear only a pure tone from a voice recording, you're experiencing the fundamental frequency isolated from its harmonics, proving that even rich, recognizable sounds are built from basic sine waves stacked at multiples of the fundamental.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">📋 Project Goals</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Demonstrate Wave Composition:</strong> Prove all sounds are made of simple sine waves through interactive filtering</li>
                      <li><strong>Real-time Frequency Analysis:</strong> Visualize audio spectrum in real-time with high resolution (8192 FFT size)</li>
                      <li><strong>Precision Isolation:</strong> Extract individual frequency components with extreme brick-wall filters (16th-order, -192dB/octave)</li>
                      <li><strong>Harmonic Analysis:</strong> Study fundamental frequencies and overtones in voice and musical instruments</li>
                      <li><strong>Educational Tool:</strong> Learn about frequency domains, harmonics, and Fourier analysis through direct experience</li>
                      <li><strong>Research Platform:</strong> Analyze voice characteristics, musical timbre, and acoustic properties</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">🎵 What This Application Does</h3>
                    <p className="text-gray-700 mb-3">
                      Voice Spectrum Analyzer is a professional-grade web application for analyzing audio frequencies
                      in real-time. It allows you to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Record audio from your microphone with anti-clipping protection</li>
                      <li>Load and play audio files (WAV, MP3, etc.)</li>
                      <li>Visualize the full frequency spectrum (0-20,000 Hz) with logarithmic scaling</li>
                      <li>Apply extreme brick-wall band-pass filters with draggable cutoffs</li>
                      <li>Isolate fundamental frequencies and remove harmonics</li>
                      <li>Generate test tones to verify filter performance</li>
                      <li>Save and manage recordings with rename/delete functionality</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">🔧 Technology Stack</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-bold mb-2">Frontend</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• React 18</li>
                          <li>• TypeScript</li>
                          <li>• TailwindCSS v3</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-bold mb-2">Audio Processing</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Web Audio API</li>
                          <li>• Canvas API</li>
                          <li>• MediaRecorder API</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-bold mb-2">State Management</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Zustand</li>
                          <li>• localStorage</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-bold mb-2">Deployment</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Vercel (staging)</li>
                          <li>• GitHub</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">✨ Key Features</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <h4 className="font-bold">Extreme Brick-Wall Filtering</h4>
                        <p className="text-sm text-gray-700">32 cascaded BiquadFilters (16 high-pass + 16 low-pass) provide near-perfect square frequency response with -192dB/octave rolloff</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                        <h4 className="font-bold">High-Resolution FFT</h4>
                        <p className="text-sm text-gray-700">8192-point FFT provides ~5.86 Hz resolution at 48kHz, perfect for analyzing low frequencies and voice fundamentals</p>
                      </div>
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                        <h4 className="font-bold">Draggable Filter Controls</h4>
                        <p className="text-sm text-gray-700">Click and drag on the spectrogram edges to adjust filter cutoffs in real-time while watching the visualization</p>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <h4 className="font-bold">Split Audio Path</h4>
                        <p className="text-sm text-gray-700">Visualize full unfiltered spectrum while hearing only the filtered passband - see everything, hear what you want</p>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">📚 Use Cases</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Voice Analysis:</strong> Study vocal characteristics, pitch, and formants</li>
                      <li><strong>Music Education:</strong> Visualize harmonics and overtone series</li>
                      <li><strong>Instrument Timbre:</strong> Analyze frequency content of different instruments</li>
                      <li><strong>Filter Testing:</strong> Verify extreme filter performance with test tones</li>
                      <li><strong>Acoustic Research:</strong> Measure and analyze sound in frequency domain</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">📝 Version History & Changelog</h3>
                    <div className="space-y-3">
                      {CHANGELOG.map((entry) => {
                        const isExpanded = expandedVersions.has(entry.version);
                        const badgeColor = entry.type === 'major' ? 'bg-red-500' : entry.type === 'minor' ? 'bg-blue-500' : 'bg-green-500';

                        return (
                          <div key={entry.version} className="border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleVersion(entry.version)}
                              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                                <span className="font-bold text-lg">v{entry.version}</span>
                                <span className={`${badgeColor} text-white text-xs px-2 py-1 rounded uppercase`}>
                                  {entry.type}
                                </span>
                                <span className="text-sm text-gray-600">{entry.date}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {entry.changes.length} change{entry.changes.length !== 1 ? 's' : ''}
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="px-4 py-3 bg-white border-t border-gray-200">
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                  {entry.changes.map((change, idx) => (
                                    <li key={idx}>{change}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="text-center py-6 border-t border-gray-200">
                    <p className="text-gray-600">
                      Built with ❤️ by <strong>Toby Balsley</strong> using Claude Code
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <a
                        href="https://github.com/ybotman/voice-spectrum"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 underline"
                      >
                        GitHub Repository
                      </a>
                      {' • '}
                      <a
                        href="https://hdtsllc.atlassian.net/browse/VOICE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 underline"
                      >
                        JIRA Project
                      </a>
                    </p>
                  </section>
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
