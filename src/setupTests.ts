// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Web Audio API
class MockAudioContext {
  createAnalyser() {
    return {
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      minDecibels: -90,
      maxDecibels: -10,
      connect: jest.fn(),
      disconnect: jest.fn(),
      getByteFrequencyData: jest.fn(),
      getFloatFrequencyData: jest.fn()
    };
  }

  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 0 },
      Q: { value: 0 },
      gain: { value: 0 },
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      start: jest.fn(),
      stop: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  createBuffer() {
    return {
      length: 0,
      duration: 0,
      sampleRate: 44100,
      numberOfChannels: 2,
      getChannelData: jest.fn(() => new Float32Array(0))
    };
  }

  decodeAudioData() {
    return Promise.resolve(this.createBuffer());
  }

  get destination() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  get state() {
    return 'running';
  }

  resume() {
    return Promise.resolve();
  }

  suspend() {
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }
}

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    // Simulate recording
  }

  stop() {
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    // Mock pause
  }

  resume() {
    // Mock resume
  }

  static isTypeSupported() {
    return true;
  }
}

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: jest.fn()
          }
        ]
      })
    )
  },
  writable: true
});

// Add mocks to global
(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;
(global as any).MediaRecorder = MockMediaRecorder;
