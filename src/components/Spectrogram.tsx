import { useEffect, useRef } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useAudioContext } from '../hooks/useAudioContext';

export const Spectrogram = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const spectrogramDataRef = useRef<ImageData | null>(null);

  const { analyserNode } = useAudioContext();
  const { playbackState, spectrogramSettings } = useAudioStore();
  const isPlaying = playbackState === 'playing';

  useEffect(() => {
    if (!canvasRef.current || !analyserNode) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.width;
    const height = canvas.height;

    // Get FFT data
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Initialize spectrogram if needed
    if (!spectrogramDataRef.current) {
      spectrogramDataRef.current = ctx.createImageData(width, height);
    }

    const draw = () => {
      if (!isPlaying) {
        // If not playing, just clear or show static view
        return;
      }

      // Get frequency data
      analyserNode.getByteFrequencyData(dataArray);

      // Shift existing spectrogram data left by 1 pixel
      const imageData = spectrogramDataRef.current!;
      const pixels = imageData.data;

      // Shift left
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width - 1; x++) {
          const sourceIndex = (y * width + (x + 1)) * 4;
          const targetIndex = (y * width + x) * 4;
          pixels[targetIndex] = pixels[sourceIndex];         // R
          pixels[targetIndex + 1] = pixels[sourceIndex + 1]; // G
          pixels[targetIndex + 2] = pixels[sourceIndex + 2]; // B
          pixels[targetIndex + 3] = pixels[sourceIndex + 3]; // A
        }
      }

      // Add new column of data on the right
      const maxFreq = spectrogramSettings.maxFrequency;
      const minFreq = spectrogramSettings.minFrequency;
      const nyquist = analyserNode.context.sampleRate / 2;

      for (let y = 0; y < height; y++) {
        // Map y position to frequency
        let freq;
        if (spectrogramSettings.frequencyScale === 'logarithmic') {
          // Logarithmic scale
          const logMin = Math.log(Math.max(minFreq, 20)); // Avoid log(0)
          const logMax = Math.log(maxFreq);
          const logFreq = logMax - (y / height) * (logMax - logMin);
          freq = Math.exp(logFreq);
        } else {
          // Linear scale
          freq = maxFreq - (y / height) * (maxFreq - minFreq);
        }

        // Map frequency to FFT bin
        const binIndex = Math.floor((freq / nyquist) * bufferLength);
        const clampedBin = Math.max(0, Math.min(bufferLength - 1, binIndex));
        const magnitude = dataArray[clampedBin];

        // Convert magnitude to color (hot colormap: black -> red -> yellow -> white)
        const color = getHotColor(magnitude / 255);

        // Set pixel in rightmost column
        const pixelIndex = (y * width + (width - 1)) * 4;
        pixels[pixelIndex] = color.r;
        pixels[pixelIndex + 1] = color.g;
        pixels[pixelIndex + 2] = color.b;
        pixels[pixelIndex + 3] = 255; // Alpha
      }

      // Draw the updated spectrogram
      ctx.putImageData(imageData, 0, 0);

      // Add frequency labels
      drawFrequencyAxis(ctx, height, minFreq, maxFreq, spectrogramSettings.frequencyScale);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    } else {
      // Draw initial state
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#a0aec0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Start playback to see spectrogram', width / 2, height / 2);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isPlaying, spectrogramSettings]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Spectrogram Visualization</h2>
      <div className="bg-gray-800 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Scale:</span> {spectrogramSettings.frequencyScale}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Range:</span> {spectrogramSettings.minFrequency} - {spectrogramSettings.maxFrequency} Hz
        </div>
      </div>
    </div>
  );
};

// Hot colormap: black -> red -> yellow -> white
function getHotColor(value: number): { r: number; g: number; b: number } {
  // Clamp value between 0 and 1
  const v = Math.max(0, Math.min(1, value));

  if (v < 0.25) {
    // Black to dark red
    return { r: Math.floor(v * 4 * 255), g: 0, b: 0 };
  } else if (v < 0.5) {
    // Dark red to bright red
    return { r: 255, g: 0, b: 0 };
  } else if (v < 0.75) {
    // Red to yellow
    const t = (v - 0.5) * 4;
    return { r: 255, g: Math.floor(t * 255), b: 0 };
  } else {
    // Yellow to white
    const t = (v - 0.75) * 4;
    return { r: 255, g: 255, b: Math.floor(t * 255) };
  }
}

// Draw frequency axis labels
function drawFrequencyAxis(
  ctx: CanvasRenderingContext2D,
  height: number,
  minFreq: number,
  maxFreq: number,
  scale: 'linear' | 'logarithmic'
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';

  // Draw frequency labels at intervals
  const labels = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

  labels.forEach((freq) => {
    if (freq < minFreq || freq > maxFreq) return;

    let y;
    if (scale === 'logarithmic') {
      const logMin = Math.log(Math.max(minFreq, 20));
      const logMax = Math.log(maxFreq);
      const logFreq = Math.log(freq);
      y = height - ((logFreq - logMin) / (logMax - logMin)) * height;
    } else {
      y = height - ((freq - minFreq) / (maxFreq - minFreq)) * height;
    }

    // Draw label
    const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
    ctx.fillText(label, 5, y + 3);

    // Draw tick mark
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(20, y);
    ctx.stroke();
  });
}
