import { useEffect, useRef } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useAudioContext } from '../hooks/useAudioContext';

export const AudioLevelMeter = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const { recordingState } = useAudioStore();
  const { analyserNode } = useAudioContext();
  const isRecording = recordingState === 'recording';

  useEffect(() => {
    if (!canvasRef.current || !analyserNode || !isRecording) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    const draw = () => {
      analyserNode.getByteTimeDomainData(dataArray);

      // Calculate RMS (Root Mean Square) level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const level = rms * 100; // Convert to percentage

      // Draw level meter
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw level bar
      const barWidth = (level / 100) * canvas.width;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#48bb78'); // green
      gradient.addColorStop(0.7, '#ecc94b'); // yellow
      gradient.addColorStop(1, '#f56565'); // red

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, barWidth, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isRecording]);

  if (!isRecording) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-gray-600 mb-2">Input Level</div>
      <canvas
        ref={canvasRef}
        width={300}
        height={30}
        className="w-full rounded border border-gray-300"
      />
    </div>
  );
};
