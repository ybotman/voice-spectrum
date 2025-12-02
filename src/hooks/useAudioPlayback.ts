import { useCallback, useRef, useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';
import { PlaybackState, AudioRecording } from '../types/audio';
import { useAudioContext } from './useAudioContext';

export const useAudioPlayback = () => {
  const {
    playbackState,
    currentAudioBuffer,
    selectedRecording,
    filterSettings,
    loopEnabled,
    setPlaybackState,
    setCurrentAudioBuffer
  } = useAudioStore();

  const { audioContext, analyserNode } = useAudioContext();
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Store all filter nodes for real-time updates
  const highPassFiltersRef = useRef<BiquadFilterNode[]>([]);
  const lowPassFiltersRef = useRef<BiquadFilterNode[]>([]);

  // Load audio from recording
  const loadAudio = useCallback(async (recording: AudioRecording) => {
    if (!audioContext) {
      console.error('Audio context not initialized');
      return;
    }

    try {
      console.log('Loading audio from recording:', recording.name, 'Blob size:', recording.blob.size, 'bytes');
      const arrayBuffer = await recording.blob.arrayBuffer();
      console.log('ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Audio decoded:', audioBuffer.duration, 'seconds,', audioBuffer.numberOfChannels, 'channels,', audioBuffer.sampleRate, 'Hz');
      setCurrentAudioBuffer(audioBuffer);
    } catch (err) {
      console.error('Failed to load audio:', err);
    }
  }, [audioContext, setCurrentAudioBuffer]);

  // Create and configure filters with MAXIMUM rolloff for brick-wall response
  const setupFilters = useCallback(() => {
    if (!audioContext || !analyserNode) return null;

    // Create 16-stage cascaded filters for extreme brick-wall response
    // 16 filters = -192dB/octave rolloff (near-perfect square cutoff)
    // At 1 octave out: -192dB (complete silence)
    // At 0.5 octave out: -96dB (essentially silent)
    const highPassFilters: BiquadFilterNode[] = [];
    const lowPassFilters: BiquadFilterNode[] = [];

    // Create 16 high-pass filters
    for (let i = 0; i < 16; i++) {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = filterSettings.highPassCutoff;
      filter.Q.value = 0.7071; // Butterworth response (maximally flat passband)
      highPassFilters.push(filter);
    }

    // Create 16 low-pass filters
    for (let i = 0; i < 16; i++) {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterSettings.lowPassCutoff;
      filter.Q.value = 0.7071;
      lowPassFilters.push(filter);
    }

    // Chain high-pass filters together
    for (let i = 0; i < highPassFilters.length - 1; i++) {
      highPassFilters[i].connect(highPassFilters[i + 1]);
    }

    // Chain low-pass filters together
    for (let i = 0; i < lowPassFilters.length - 1; i++) {
      lowPassFilters[i].connect(lowPassFilters[i + 1]);
    }

    // Store all filters for real-time updates
    highPassFiltersRef.current = highPassFilters;
    lowPassFiltersRef.current = lowPassFilters;

    return {
      highPassFirst: highPassFilters[0],
      highPassLast: highPassFilters[highPassFilters.length - 1],
      lowPassFirst: lowPassFilters[0],
      lowPassLast: lowPassFilters[lowPassFilters.length - 1]
    };
  }, [audioContext, analyserNode, filterSettings]);

  // Play audio with looping
  const play = useCallback(async () => {
    if (!audioContext || !currentAudioBuffer || !analyserNode) {
      console.error('Audio not ready for playback');
      return;
    }

    // Check AudioContext state and resume if needed
    console.log('AudioContext state before play:', audioContext.state);
    if (audioContext.state === 'suspended') {
      console.log('Resuming suspended AudioContext...');
      await audioContext.resume();
      console.log('AudioContext resumed, new state:', audioContext.state);
    } else if (audioContext.state === 'closed') {
      console.error('AudioContext is closed! Need to recreate it.');
      alert('Audio context was closed. Please refresh the page to continue.');
      return;
    }

    // Stop any existing playback
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }

    // Create source node
    const source = audioContext.createBufferSource();
    source.buffer = currentAudioBuffer;
    source.loop = loopEnabled; // Enable/disable looping based on user preference
    sourceNodeRef.current = source;

    // If not looping, stop playback when audio ends
    if (!loopEnabled) {
      source.onended = () => {
        setPlaybackState(PlaybackState.STOPPED);
      };
    }

    // Setup audio chain with SPLIT PATH:
    // 1. Source -> Analyser (for visualization of FULL spectrum)
    // 2. Source -> Filters -> Speakers (for filtered audio playback)
    console.log('Filter settings:', filterSettings);
    if (filterSettings.enabled) {
      console.log('Filters ENABLED - setting up filter chain...');
      const filters = setupFilters();
      if (filters) {
        console.log('Filter nodes created successfully');
        // Path 1: Full spectrum visualization (unfiltered)
        source.connect(analyserNode);

        // Path 2: Filtered audio to speakers
        source.connect(filters.highPassFirst);
        filters.highPassLast.connect(filters.lowPassFirst);
        filters.lowPassLast.connect(audioContext.destination);

        // Calculate expected attenuation at key frequencies for debugging
        const bandwidth = filterSettings.lowPassCutoff - filterSettings.highPassCutoff;
        const firstHarmonic = filterSettings.highPassCutoff * 2; // 200Hz if filtering 100Hz
        const octavesAboveLowPass = Math.log2(firstHarmonic / filterSettings.lowPassCutoff);
        const attenuationAtSecondHarmonic = octavesAboveLowPass * -192; // dB

        console.log('EXTREME BRICK-WALL filter active:');
        console.log('  High-pass:', filterSettings.highPassCutoff, 'Hz (16th order, -192dB/octave)');
        console.log('  Low-pass:', filterSettings.lowPassCutoff, 'Hz (16th order, -192dB/octave)');
        console.log('  Passband width:', bandwidth.toFixed(1), 'Hz');
        console.log('  Expected attenuation at 2nd harmonic (2x):', attenuationAtSecondHarmonic.toFixed(1), 'dB');
        console.log('  Audio path: Source → 32 cascaded filters → Speakers');
        console.log('  Visual path: Source → Analyser (unfiltered for full spectrum view)');
      } else {
        source.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
      }
    } else {
      // No filtering: direct path
      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
    }

    // Start playback
    source.start(0);
    setPlaybackState(PlaybackState.PLAYING);

    console.log('Playback started. Audio buffer:', currentAudioBuffer.length, 'samples,', currentAudioBuffer.duration, 'seconds');
  }, [audioContext, currentAudioBuffer, analyserNode, filterSettings, loopEnabled, setupFilters, setPlaybackState]);

  const stop = useCallback(() => {
    console.log('Stop button clicked. SourceNode exists:', !!sourceNodeRef.current);
    if (sourceNodeRef.current) {
      try {
        console.log('Stopping audio source...');
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        console.log('Audio source stopped and disconnected');
      } catch (err) {
        console.error('Error stopping source:', err);
      }
      sourceNodeRef.current = null;
    } else {
      console.warn('No active source to stop');
    }

    // Disconnect all filters if they exist
    highPassFiltersRef.current.forEach(filter => {
      if (filter) {
        try {
          filter.disconnect();
        } catch (err) {
          console.warn('Error disconnecting high-pass filter:', err);
        }
      }
    });

    lowPassFiltersRef.current.forEach(filter => {
      if (filter) {
        try {
          filter.disconnect();
        } catch (err) {
          console.warn('Error disconnecting low-pass filter:', err);
        }
      }
    });

    // Clear filter arrays
    highPassFiltersRef.current = [];
    lowPassFiltersRef.current = [];

    setPlaybackState(PlaybackState.STOPPED);
  }, [setPlaybackState]);

  const pause = useCallback(() => {
    if (audioContext && audioContext.state !== 'closed' && playbackState === PlaybackState.PLAYING) {
      audioContext.suspend();
      setPlaybackState(PlaybackState.PAUSED);
    } else if (audioContext?.state === 'closed') {
      console.error('Cannot pause: AudioContext is closed');
    }
  }, [audioContext, playbackState, setPlaybackState]);

  const resume = useCallback(async () => {
    if (audioContext && audioContext.state !== 'closed' && playbackState === PlaybackState.PAUSED) {
      await audioContext.resume();
      setPlaybackState(PlaybackState.PLAYING);
    } else if (audioContext?.state === 'closed') {
      console.error('Cannot resume: AudioContext is closed');
    }
  }, [audioContext, playbackState, setPlaybackState]);

  // Track previous filter enabled state to detect toggles
  const prevFilterEnabledRef = useRef(filterSettings.enabled);
  // Flag to trigger restart without including play() in dependencies
  const needsRestartRef = useRef(false);

  // Update all filters in real-time when settings change
  useEffect(() => {
    const filterWasToggled = prevFilterEnabledRef.current !== filterSettings.enabled;
    prevFilterEnabledRef.current = filterSettings.enabled;

    if (filterSettings.enabled) {
      // If filters exist, update their frequencies
      if (highPassFiltersRef.current.length > 0) {
        highPassFiltersRef.current.forEach(filter => {
          if (filter) {
            filter.frequency.value = filterSettings.highPassCutoff;
          }
        });

        lowPassFiltersRef.current.forEach(filter => {
          if (filter) {
            filter.frequency.value = filterSettings.lowPassCutoff;
          }
        });
      }
    }

    // If filter was toggled ON/OFF during playback, mark for restart
    if (filterWasToggled && playbackState === PlaybackState.PLAYING && currentAudioBuffer) {
      needsRestartRef.current = true;
    }
  }, [filterSettings, playbackState, currentAudioBuffer]);

  // Separate effect to handle restart - avoids circular dependency with play()
  useEffect(() => {
    if (needsRestartRef.current && playbackState === PlaybackState.PLAYING && currentAudioBuffer && audioContext && analyserNode) {
      needsRestartRef.current = false;
      console.log('Filter toggled during playback - restarting audio to apply changes');

      // Stop current playback
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch (err) {
          // Ignore errors if already stopped
        }
        sourceNodeRef.current = null;
      }
      // Clear old filters
      highPassFiltersRef.current.forEach(f => { try { f?.disconnect(); } catch {} });
      lowPassFiltersRef.current.forEach(f => { try { f?.disconnect(); } catch {} });
      highPassFiltersRef.current = [];
      lowPassFiltersRef.current = [];

      // Restart playback with new filter state
      setTimeout(() => {
        play();
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSettings.enabled]); // Only re-run when enabled state changes

  return {
    playbackState,
    currentAudioBuffer,
    selectedRecording,
    loadAudio,
    play,
    stop,
    pause,
    resume
  };
};
