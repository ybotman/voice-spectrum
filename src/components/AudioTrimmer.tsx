import { useState, useRef, useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useAudioContext } from '../hooks/useAudioContext';
import { AudioRecording } from '../types/audio';

export const AudioTrimmer = () => {
  const { audioContext } = useAudioContext();
  const { selectedRecording, setSelectedRecording, addRecording } = useAudioStore();
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(100);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load audio buffer when selected recording changes
  useEffect(() => {
    if (!selectedRecording || !audioContext) {
      setAudioBuffer(null);
      return;
    }

    const loadBuffer = async () => {
      try {
        const arrayBuffer = await selectedRecording.blob.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(buffer);
        setTrimStart(0);
        setTrimEnd(100);
      } catch (err) {
        console.error('Failed to load audio for trimming:', err);
      }
    };

    loadBuffer();
  }, [selectedRecording, audioContext]);

  // Draw waveform
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    // Get audio data from first channel
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i++) {
      const min = Math.min(...Array.from({ length: step }, (_, j) => data[i * step + j] || 0));
      const max = Math.max(...Array.from({ length: step }, (_, j) => data[i * step + j] || 0));

      if (i === 0) {
        ctx.moveTo(i, (1 + min) * amp);
      }

      ctx.lineTo(i, (1 + max) * amp);
      ctx.lineTo(i, (1 + min) * amp);
    }

    ctx.stroke();

    // Draw trim overlay (grey out trimmed areas)
    const startX = (trimStart / 100) * width;
    const endX = (trimEnd / 100) * width;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, startX, height);
    ctx.fillRect(endX, 0, width - endX, height);

    // Draw trim handles
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(startX - 2, 0, 4, height);
    ctx.fillRect(endX - 2, 0, 4, height);

    // Draw trim lines
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();
  }, [audioBuffer, trimStart, trimEnd]);

  // Handle mouse down on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percent = (x / width) * 100;

    const startX = (trimStart / 100) * width;
    const endX = (trimEnd / 100) * width;

    // Check if clicking near start handle (within 10px)
    if (Math.abs(x - startX) < 10) {
      setIsDraggingStart(true);
    }
    // Check if clicking near end handle (within 10px)
    else if (Math.abs(x - endX) < 10) {
      setIsDraggingEnd(true);
    }
    // Otherwise set new trim region
    else {
      if (percent < (trimStart + trimEnd) / 2) {
        setTrimStart(Math.max(0, percent));
      } else {
        setTrimEnd(Math.min(100, percent));
      }
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    if (!isDraggingStart && !isDraggingEnd) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percent = Math.max(0, Math.min(100, (x / width) * 100));

    if (isDraggingStart) {
      setTrimStart(Math.min(percent, trimEnd - 1));
    } else if (isDraggingEnd) {
      setTrimEnd(Math.max(percent, trimStart + 1));
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
  };

  // Apply trim
  const handleApplyTrim = async () => {
    if (!audioBuffer || !audioContext || !selectedRecording) return;

    setIsProcessing(true);

    try {
      const startTime = (trimStart / 100) * audioBuffer.duration;
      const endTime = (trimEnd / 100) * audioBuffer.duration;
      const duration = endTime - startTime;

      const startFrame = Math.floor(startTime * audioBuffer.sampleRate);
      const endFrame = Math.floor(endTime * audioBuffer.sampleRate);
      const frameCount = endFrame - startFrame;

      // Create new buffer with trimmed audio
      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        audioBuffer.sampleRate
      );

      // Copy trimmed data for each channel
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          newData[i] = oldData[startFrame + i];
        }
      }

      // Convert buffer to WAV blob
      const wav = audioBufferToWav(trimmedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });

      // Create new recording with trimmed audio
      const trimmedRecording: AudioRecording = {
        id: `trimmed-${Date.now()}`,
        name: `${selectedRecording.name} (Trimmed)`,
        blob: blob,
        duration: duration,
        createdAt: new Date()
      };

      addRecording(trimmedRecording);
      setSelectedRecording(trimmedRecording);

      // Reset trim handles
      setTrimStart(0);
      setTrimEnd(100);

      alert(`Audio trimmed successfully! New duration: ${duration.toFixed(2)}s`);
    } catch (err) {
      console.error('Failed to trim audio:', err);
      alert('Failed to trim audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset trim
  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(100);
  };

  if (!selectedRecording) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Audio Trimmer</h2>
        <p className="text-gray-600">No audio selected. Load or record audio to use the trimmer.</p>
      </div>
    );
  }

  if (!audioBuffer) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Audio Trimmer</h2>
        <p className="text-gray-600">Loading audio...</p>
      </div>
    );
  }

  const startTime = (trimStart / 100) * audioBuffer.duration;
  const endTime = (trimEnd / 100) * audioBuffer.duration;
  const trimmedDuration = endTime - startTime;

  return (
    <div className="bg-white rounded-lg shadow-md p-6" ref={containerRef}>
      <h2 className="text-2xl font-bold mb-4">Audio Trimmer</h2>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="font-semibold">{selectedRecording.name}</p>
        <p className="text-sm text-gray-600">
          Original: {audioBuffer.duration.toFixed(2)}s • Trimmed: {trimmedDuration.toFixed(2)}s
        </p>
      </div>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full border border-gray-300 rounded cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Start Time: {startTime.toFixed(2)}s</label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={trimStart}
            onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd - 1))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">End Time: {endTime.toFixed(2)}s</label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={trimEnd}
            onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart + 1))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleApplyTrim}
          disabled={isProcessing || trimmedDuration <= 0}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded transition"
        >
          {isProcessing ? 'Processing...' : 'Apply Trim'}
        </button>
        <button
          onClick={handleReset}
          disabled={isProcessing}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded transition"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500">
        <p className="text-sm text-gray-700">
          <strong>Instructions:</strong> Drag the red handles to adjust trim points, or click on the waveform to set new positions.
          Click "Apply Trim" to create a new trimmed recording.
        </p>
      </div>
    </div>
  );
};

// Utility function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // RIFF identifier
  setUint32(0x46464952);
  // File length minus RIFF identifier length and file description length
  setUint32(length - 8);
  // RIFF type
  setUint32(0x45564157);
  // Format chunk identifier
  setUint32(0x20746d66);
  // Format chunk length
  setUint32(16);
  // Sample format (raw)
  setUint16(1);
  // Channel count
  setUint16(buffer.numberOfChannels);
  // Sample rate
  setUint32(buffer.sampleRate);
  // Byte rate (sample rate * block align)
  setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
  // Block align (channel count * bytes per sample)
  setUint16(buffer.numberOfChannels * 2);
  // Bits per sample
  setUint16(16);
  // Data chunk identifier
  setUint32(0x61746164);
  // Data chunk length
  setUint32(length - pos - 4);

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}
