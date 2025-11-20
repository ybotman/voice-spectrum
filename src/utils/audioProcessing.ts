// Audio processing utilities

/**
 * Trim an audio buffer to specified start and end times
 */
export const trimAudioBuffer = (
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number,
  audioContext: AudioContext
): AudioBuffer => {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;

  // Calculate sample positions
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const trimmedLength = endSample - startSample;

  // Create new buffer for trimmed audio
  const trimmedBuffer = audioContext.createBuffer(
    numberOfChannels,
    trimmedLength,
    sampleRate
  );

  // Copy trimmed samples for each channel
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const targetData = trimmedBuffer.getChannelData(channel);

    for (let i = 0; i < trimmedLength; i++) {
      targetData[i] = sourceData[startSample + i];
    }
  }

  return trimmedBuffer;
};

/**
 * Convert AudioBuffer to WAV Blob
 */
export const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numberOfChannels * 2; // 16-bit samples

  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true); // byte rate
  view.setUint16(32, numberOfChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write audio samples
  const offset = 44;
  let index = 0;

  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset + index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      index += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Create a looped audio buffer by repeating source buffer
 */
export const createLoopedBuffer = (
  audioBuffer: AudioBuffer,
  loopCount: number,
  audioContext: AudioContext
): AudioBuffer => {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const originalLength = audioBuffer.length;
  const loopedLength = originalLength * loopCount;

  const loopedBuffer = audioContext.createBuffer(
    numberOfChannels,
    loopedLength,
    sampleRate
  );

  // Copy original buffer multiple times
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const targetData = loopedBuffer.getChannelData(channel);

    for (let loop = 0; loop < loopCount; loop++) {
      const offset = loop * originalLength;
      for (let i = 0; i < originalLength; i++) {
        targetData[offset + i] = sourceData[i];
      }
    }
  }

  return loopedBuffer;
};

/**
 * Download audio buffer as WAV file
 */
export const downloadAudio = (audioBuffer: AudioBuffer, filename: string) => {
  const wavBlob = audioBufferToWav(audioBuffer);
  const url = URL.createObjectURL(wavBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Load audio file from File input
 */
export const loadAudioFile = async (
  file: File,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
};
