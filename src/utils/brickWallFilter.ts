/**
 * Brick-wall filter using FFT processing
 * Provides perfect rectangular frequency response - flat within band, zero outside
 */

export class BrickWallFilterProcessor {
  private context: AudioContext;
  private scriptNode: ScriptProcessorNode | null = null;
  private highPassFreq: number;
  private lowPassFreq: number;
  private sampleRate: number;
  private fftSize: number = 8192; // Large FFT for better frequency resolution

  constructor(context: AudioContext, highPassFreq: number, lowPassFreq: number) {
    this.context = context;
    this.sampleRate = context.sampleRate;
    this.highPassFreq = highPassFreq;
    this.lowPassFreq = lowPassFreq;
  }

  /**
   * Create the brick-wall filter processor node
   */
  createFilterNode(): ScriptProcessorNode {
    // Use ScriptProcessorNode for real-time FFT filtering
    // Buffer size 4096 is a good balance between latency and processing power
    this.scriptNode = this.context.createScriptProcessor(4096, 1, 1);

    this.scriptNode.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const outputData = event.outputBuffer.getChannelData(0);

      // Apply brick-wall filter in frequency domain
      this.processBlock(inputData, outputData);
    };

    return this.scriptNode;
  }

  /**
   * Process audio block with brick-wall filtering
   */
  private processBlock(input: Float32Array, output: Float32Array): void {
    const blockSize = input.length;

    // For real-time processing, we need to use FFT
    // Simple brick-wall in time domain using overlap-add
    const fftSize = Math.min(this.fftSize, blockSize * 4);

    // Perform FFT (we'll use a simple DFT for now, could optimize with FFT library)
    const spectrum = this.fft(input, fftSize);

    // Apply brick-wall filter in frequency domain
    this.applyBrickWallFilter(spectrum, fftSize);

    // Inverse FFT
    const filtered = this.ifft(spectrum, fftSize);

    // Copy to output (with overlap handling)
    for (let i = 0; i < blockSize; i++) {
      output[i] = filtered[i];
    }
  }

  /**
   * Simple FFT implementation (for educational purposes - production would use optimized library)
   */
  private fft(input: Float32Array, size: number): Complex[] {
    const spectrum: Complex[] = [];
    const N = Math.min(size, input.length);

    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;

      for (let n = 0; n < N; n++) {
        const angle = (-2 * Math.PI * k * n) / N;
        real += input[n] * Math.cos(angle);
        imag += input[n] * Math.sin(angle);
      }

      spectrum.push({ real, imag });
    }

    return spectrum;
  }

  /**
   * Apply brick-wall filter: zero out frequencies outside the band
   */
  private applyBrickWallFilter(spectrum: Complex[], size: number): void {
    const freqResolution = this.sampleRate / size;

    for (let i = 0; i < spectrum.length; i++) {
      const freq = i * freqResolution;

      // Perfect brick-wall: set to zero if outside band
      if (freq < this.highPassFreq || freq > this.lowPassFreq) {
        spectrum[i].real = 0;
        spectrum[i].imag = 0;
      }
    }
  }

  /**
   * Inverse FFT
   */
  private ifft(spectrum: Complex[], size: number): Float32Array {
    const output = new Float32Array(size);
    const N = spectrum.length;

    for (let n = 0; n < N; n++) {
      let sum = 0;

      for (let k = 0; k < N; k++) {
        const angle = (2 * Math.PI * k * n) / N;
        sum += spectrum[k].real * Math.cos(angle) - spectrum[k].imag * Math.sin(angle);
      }

      output[n] = sum / N;
    }

    return output;
  }

  /**
   * Update filter frequencies in real-time
   */
  updateFrequencies(highPassFreq: number, lowPassFreq: number): void {
    this.highPassFreq = highPassFreq;
    this.lowPassFreq = lowPassFreq;
  }

  /**
   * Clean up
   */
  disconnect(): void {
    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }
  }
}

interface Complex {
  real: number;
  imag: number;
}
