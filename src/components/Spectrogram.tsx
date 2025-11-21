import { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useAudioContext } from '../hooks/useAudioContext';
import { PlaybackState } from '../types/audio';

export const Spectrogram = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const spectrogramDataRef = useRef<ImageData | null>(null);
  const [isDraggingHighPass, setIsDraggingHighPass] = useState(false);
  const [isDraggingLowPass, setIsDraggingLowPass] = useState(false);

  const { analyserNode } = useAudioContext();
  const { playbackState, spectrogramSettings, filterSettings, setSpectrogramSettings, setFilterSettings } = useAudioStore();
  const isPlaying = playbackState === PlaybackState.PLAYING;

  console.log('Spectrogram render - playbackState:', playbackState, 'isPlaying:', isPlaying, 'analyserNode:', !!analyserNode);

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

      // Draw grid lines
      drawGrid(ctx, width, height, minFreq, maxFreq, spectrogramSettings.frequencyScale);

      // Draw filter band highlight
      drawFilterBand(ctx, height, minFreq, maxFreq, spectrogramSettings.frequencyScale);

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
  }, [analyserNode, isPlaying, spectrogramSettings, filterSettings]);

  const toggleScale = () => {
    setSpectrogramSettings({
      ...spectrogramSettings,
      frequencyScale: spectrogramSettings.frequencyScale === 'linear' ? 'logarithmic' : 'linear'
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Left 10% for high-pass drag
    if (x < width * 0.1) {
      setIsDraggingHighPass(true);
    }
    // Right 10% for low-pass drag
    else if (x > width * 0.9) {
      setIsDraggingLowPass(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    if (!isDraggingHighPass && !isDraggingLowPass) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Convert Y position to frequency
    const { minFrequency, maxFrequency, frequencyScale } = spectrogramSettings;
    let freq;

    if (frequencyScale === 'logarithmic') {
      const logMin = Math.log(Math.max(minFrequency, 20));
      const logMax = Math.log(maxFrequency);
      const logFreq = logMax - (y / height) * (logMax - logMin);
      freq = Math.exp(logFreq);
    } else {
      freq = maxFrequency - (y / height) * (maxFrequency - minFrequency);
    }

    freq = Math.max(20, Math.min(20000, Math.round(freq)));

    if (isDraggingHighPass) {
      setFilterSettings({
        ...filterSettings,
        highPassCutoff: Math.min(freq, filterSettings.lowPassCutoff - 50),
        enabled: true
      });
    } else if (isDraggingLowPass) {
      setFilterSettings({
        ...filterSettings,
        lowPassCutoff: Math.max(freq, filterSettings.highPassCutoff + 50),
        enabled: true
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingHighPass(false);
    setIsDraggingLowPass(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Spectrogram Visualization</h2>
        <button
          onClick={toggleScale}
          className={`px-4 py-2 rounded font-semibold transition text-sm ${
            spectrogramSettings.frequencyScale === 'logarithmic'
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          {spectrogramSettings.frequencyScale === 'linear' ? 'Linear' : 'Log'}
        </button>
      </div>
      <div className="bg-gray-800 rounded overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full cursor-ew-resize"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Click left edge to drag high-pass filter • Click right edge to drag low-pass filter
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

// Draw grid lines for time and frequency
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  minFreq: number,
  maxFreq: number,
  scale: 'linear' | 'logarithmic'
) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;

  // Horizontal lines (frequency)
  const freqLines = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  freqLines.forEach((freq) => {
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

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  });

  // Vertical lines (time) - every 100 pixels
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  for (let x = 100; x < width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

// Draw filter band - INVERTED: grey out filtered areas, show passband clear
function drawFilterBand(
  ctx: CanvasRenderingContext2D,
  height: number,
  minFreq: number,
  maxFreq: number,
  scale: 'linear' | 'logarithmic'
) {
  // Get filter settings from the component's scope
  const filterSettings = useAudioStore.getState().filterSettings;

  if (!filterSettings.enabled) return;

  const highPass = filterSettings.highPassCutoff;
  const lowPass = filterSettings.lowPassCutoff;

  // Calculate Y positions for filter boundaries
  let yHigh, yLow;

  if (scale === 'logarithmic') {
    const logMin = Math.log(Math.max(minFreq, 20));
    const logMax = Math.log(maxFreq);
    const logHigh = Math.log(Math.max(highPass, 20));
    const logLow = Math.log(Math.max(lowPass, 20));
    yHigh = height - ((logHigh - logMin) / (logMax - logMin)) * height;
    yLow = height - ((logLow - logMin) / (logMax - logMin)) * height;
  } else {
    yHigh = height - ((highPass - minFreq) / (maxFreq - minFreq)) * height;
    yLow = height - ((lowPass - minFreq) / (maxFreq - minFreq)) * height;
  }

  // INVERTED: Draw grey overlay on FILTERED areas (outside passband)
  ctx.fillStyle = 'rgba(128, 128, 128, 0.6)'; // Grey, more opaque

  // Grey out frequencies ABOVE low-pass (filtered out)
  ctx.fillRect(0, 0, ctx.canvas.width, yLow);

  // Grey out frequencies BELOW high-pass (filtered out)
  ctx.fillRect(0, yHigh, ctx.canvas.width, height - yHigh);

  // Draw border lines for filter cutoffs
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.9)'; // Red lines for cutoffs
  ctx.lineWidth = 2;

  // High-pass cutoff line (bottom of passband)
  ctx.beginPath();
  ctx.moveTo(0, yHigh);
  ctx.lineTo(ctx.canvas.width, yHigh);
  ctx.stroke();

  // Low-pass cutoff line (top of passband)
  ctx.beginPath();
  ctx.moveTo(0, yLow);
  ctx.lineTo(ctx.canvas.width, yLow);
  ctx.stroke();

  // Add labels
  ctx.fillStyle = 'rgba(255, 100, 100, 1)'; // Red text
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${highPass} Hz ↑ HIGH-PASS`, ctx.canvas.width - 5, yHigh - 5);
  ctx.fillText(`${lowPass} Hz ↓ LOW-PASS`, ctx.canvas.width - 5, yLow + 15);
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

    // Draw tick mark (thicker than grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(25, y);
    ctx.stroke();
  });
}
