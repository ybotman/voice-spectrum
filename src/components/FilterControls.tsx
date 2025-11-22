import { useState } from 'react';
import { useAudioStore } from '../store/audioStore';

export const FilterControls = () => {
  const { filterSettings, setFilterSettings } = useAudioStore();
  const [localHighPass, setLocalHighPass] = useState(filterSettings.highPassCutoff);
  const [localLowPass, setLocalLowPass] = useState(filterSettings.lowPassCutoff);

  const handleToggleFilter = () => {
    setFilterSettings({
      ...filterSettings,
      enabled: !filterSettings.enabled
    });
  };

  const handleHighPassChange = (value: number) => {
    setLocalHighPass(value);
    // Ensure high-pass doesn't exceed low-pass
    const adjustedValue = Math.min(value, localLowPass - 100);
    setFilterSettings({
      ...filterSettings,
      highPassCutoff: adjustedValue
    });
  };

  const handleLowPassChange = (value: number) => {
    setLocalLowPass(value);
    // Ensure low-pass doesn't go below high-pass
    const adjustedValue = Math.max(value, localHighPass + 100);
    setFilterSettings({
      ...filterSettings,
      lowPassCutoff: adjustedValue
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Band-Pass Filter</h2>
        <button
          onClick={handleToggleFilter}
          className={`px-4 py-2 rounded font-semibold transition ${
            filterSettings.enabled
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          {filterSettings.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="space-y-6">
        {/* High-Pass Filter (Low Cutoff) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            High-Pass Cutoff (Remove frequencies below): {filterSettings.highPassCutoff} Hz
          </label>
          <input
            type="range"
            min="0"
            max="20000"
            step="10"
            value={localHighPass}
            onChange={(e) => handleHighPassChange(Number(e.target.value))}
            disabled={!filterSettings.enabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 Hz</span>
            <span>20,000 Hz</span>
          </div>
        </div>

        {/* Low-Pass Filter (High Cutoff) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low-Pass Cutoff (Remove frequencies above): {filterSettings.lowPassCutoff} Hz
          </label>
          <input
            type="range"
            min="0"
            max="20000"
            step="10"
            value={localLowPass}
            onChange={(e) => handleLowPassChange(Number(e.target.value))}
            disabled={!filterSettings.enabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 Hz</span>
            <span>20,000 Hz</span>
          </div>
        </div>

        {/* Band Info */}
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm font-semibold text-blue-900">Active Frequency Band:</p>
          <p className="text-lg font-bold text-blue-700">
            {filterSettings.highPassCutoff} Hz - {filterSettings.lowPassCutoff} Hz
          </p>
          <p className="text-sm text-blue-600">
            Bandwidth: {filterSettings.lowPassCutoff - filterSettings.highPassCutoff} Hz
          </p>
        </div>

        {/* Presets */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Vocal Range Presets (100 Hz wide):</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setLocalHighPass(50);
                setLocalLowPass(150);
                handleHighPassChange(50);
                handleLowPassChange(150);
              }}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition"
            >
              Low Vocal (50-150 Hz)
            </button>
            <button
              onClick={() => {
                setLocalHighPass(100);
                setLocalLowPass(200);
                handleHighPassChange(100);
                handleLowPassChange(200);
              }}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition"
            >
              Mid Vocal (100-200 Hz)
            </button>
            <button
              onClick={() => {
                setLocalHighPass(300);
                setLocalLowPass(400);
                handleHighPassChange(300);
                handleLowPassChange(400);
              }}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition"
            >
              High Vocal (300-400 Hz)
            </button>
            <button
              onClick={() => {
                setLocalHighPass(0);
                setLocalLowPass(20000);
                handleHighPassChange(0);
                handleLowPassChange(20000);
              }}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition"
            >
              Full Range
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
