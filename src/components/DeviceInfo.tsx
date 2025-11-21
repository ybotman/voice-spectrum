import { useEffect, useState } from 'react';

interface DeviceInfoState {
  inputDevice: MediaDeviceInfo | null;
  outputDevice: MediaDeviceInfo | null;
  loading: boolean;
}

export const DeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoState>({
    inputDevice: null,
    outputDevice: null,
    loading: true
  });

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        // Request permission to enumerate devices (may show permission prompt)
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Get all media devices
        const devices = await navigator.mediaDevices.enumerateDevices() || [];

        // Find default input device (microphone)
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        const defaultInput = audioInputs.find(d => d.deviceId === 'default') || audioInputs[0] || null;

        // Find default output device (speakers/headphones)
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        const defaultOutput = audioOutputs.find(d => d.deviceId === 'default') || audioOutputs[0] || null;

        setDeviceInfo({
          inputDevice: defaultInput,
          outputDevice: defaultOutput,
          loading: false
        });
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
        setDeviceInfo({ inputDevice: null, outputDevice: null, loading: false });
      }
    };

    loadDeviceInfo();

    // Listen for device changes
    const handleDeviceChange = () => {
      loadDeviceInfo();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  if (deviceInfo.loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Audio Devices</h3>
        <p className="text-sm text-gray-500">Loading device information...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">Audio Devices</h3>

      <div className="space-y-3">
        {/* Input Device */}
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎤</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-600">Input (Recording)</div>
            {deviceInfo.inputDevice ? (
              <div className="text-sm text-gray-800">
                {deviceInfo.inputDevice.label || 'Default Microphone'}
              </div>
            ) : (
              <div className="text-sm text-red-500">No input device detected</div>
            )}
          </div>
        </div>

        {/* Output Device */}
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔊</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-600">Output (Playback)</div>
            {deviceInfo.outputDevice ? (
              <div className="text-sm text-gray-800">
                {deviceInfo.outputDevice.label || 'Default Speakers'}
              </div>
            ) : (
              <div className="text-sm text-red-500">No output device detected</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          These are the devices your operating system is currently using for audio.
        </p>
      </div>
    </div>
  );
};
