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
      const analyser = ctx.createAnalyser();
      analyser.fftSize = visualizationSettings.fftSize;
      analyser.smoothingTimeConstant = visualizationSettings.smoothingTimeConstant;
      analyser.minDecibels = visualizationSettings.minDecibels;
      analyser.maxDecibels = visualizationSettings.maxDecibels;
      analyser.connect(ctx.destination);
      setAnalyserNode(analyser);
    }

    // Cleanup on unmount
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
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
