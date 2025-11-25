import { useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';

export const useAudioContext = () => {
  const {
    audioContext,
    analyserNode,
    setAudioContext,
    setAnalyserNode,
    visualizationSettings
  } = useAudioStore();

  useEffect(() => {
    // Initialize Audio Context if not already created
    if (!audioContext) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);

      // Create analyser node for visualization
      // Note: Do NOT connect analyser to destination here
      // It will be connected dynamically during playback to allow filter insertion
      const analyser = ctx.createAnalyser();

      // FFT size 8192 provides better frequency resolution, especially at low frequencies
      // Frequency resolution = sampleRate / fftSize
      // At 48kHz: 48000/8192 = ~5.86 Hz per bin (vs 2048 = 23.4 Hz per bin)
      // This gives 4x better resolution for low frequencies
      analyser.fftSize = visualizationSettings.fftSize;
      analyser.smoothingTimeConstant = visualizationSettings.smoothingTimeConstant;
      analyser.minDecibels = visualizationSettings.minDecibels;
      analyser.maxDecibels = visualizationSettings.maxDecibels;
      setAnalyserNode(analyser);
    }

    // NOTE: We don't close the AudioContext on unmount because:
    // 1. It needs to persist across tab navigation
    // 2. It should stay alive for the entire app lifetime
    // 3. The browser will clean it up when the page is closed
    // Closing it here would break playback when switching tabs

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumeAudioContext = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  };

  return {
    audioContext,
    analyserNode,
    resumeAudioContext
  };
};
