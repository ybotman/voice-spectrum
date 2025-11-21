import { useAudioStore } from '../store/audioStore';

export const SpectrogramControls = () => {
  const { spectrogramSettings, setSpectrogramSettings } = useAudioStore();

  const toggleScale = () => {
    setSpectrogramSettings({
      ...spectrogramSettings,
      frequencyScale: spectrogramSettings.frequencyScale === 'linear' ? 'logarithmic' : 'linear'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-700">Frequency Scale</h3>
          <p className="text-sm text-gray-500">
            {spectrogramSettings.frequencyScale === 'linear'
              ? 'Linear: Equal spacing for all frequencies'
              : 'Logarithmic: Musical/perceptual spacing (better for harmonics)'}
          </p>
        </div>
        <button
          onClick={toggleScale}
          className={`px-4 py-2 rounded font-semibold transition ${
            spectrogramSettings.frequencyScale === 'logarithmic'
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          {spectrogramSettings.frequencyScale === 'linear' ? 'Linear' : 'Log'}
        </button>
      </div>
    </div>
  );
};
