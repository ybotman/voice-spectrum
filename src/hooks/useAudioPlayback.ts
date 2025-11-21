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

  // Create and configure filters with steep rolloff for aggressive band-pass
  const setupFilters = useCallback(() => {
    if (!audioContext || !analyserNode) return null;

    // Create multiple cascaded high-pass filters for steeper rolloff
    // Each additional filter adds -12dB/octave, so 4 filters = -48dB/octave
    const highPass1 = audioContext.createBiquadFilter();
    highPass1.type = 'highpass';
    highPass1.frequency.value = filterSettings.highPassCutoff;
    highPass1.Q.value = 0.7071; // Butterworth response (flat passband)

    const highPass2 = audioContext.createBiquadFilter();
    highPass2.type = 'highpass';
    highPass2.frequency.value = filterSettings.highPassCutoff;
    highPass2.Q.value = 0.7071;

    const highPass3 = audioContext.createBiquadFilter();
    highPass3.type = 'highpass';
    highPass3.frequency.value = filterSettings.highPassCutoff;
    highPass3.Q.value = 0.7071;

    const highPass4 = audioContext.createBiquadFilter();
    highPass4.type = 'highpass';
    highPass4.frequency.value = filterSettings.highPassCutoff;
    highPass4.Q.value = 0.7071;

    // Create multiple cascaded low-pass filters for steeper rolloff
    const lowPass1 = audioContext.createBiquadFilter();
    lowPass1.type = 'lowpass';
    lowPass1.frequency.value = filterSettings.lowPassCutoff;
    lowPass1.Q.value = 0.7071;

    const lowPass2 = audioContext.createBiquadFilter();
    lowPass2.type = 'lowpass';
    lowPass2.frequency.value = filterSettings.lowPassCutoff;
    lowPass2.Q.value = 0.7071;

    const lowPass3 = audioContext.createBiquadFilter();
    lowPass3.type = 'lowpass';
    lowPass3.frequency.value = filterSettings.lowPassCutoff;
    lowPass3.Q.value = 0.7071;

    const lowPass4 = audioContext.createBiquadFilter();
    lowPass4.type = 'lowpass';
    lowPass4.frequency.value = filterSettings.lowPassCutoff;
    lowPass4.Q.value = 0.7071;

    // Chain high-pass filters together
    highPass1.connect(highPass2);
    highPass2.connect(highPass3);
    highPass3.connect(highPass4);

    // Chain low-pass filters together
    lowPass1.connect(lowPass2);
    lowPass2.connect(lowPass3);
    lowPass3.connect(lowPass4);

    // Store all filters for real-time updates
    highPassFiltersRef.current = [highPass1, highPass2, highPass3, highPass4];
    lowPassFiltersRef.current = [lowPass1, lowPass2, lowPass3, lowPass4];

    return {
      highPassFirst: highPass1,
      highPassLast: highPass4,
      lowPassFirst: lowPass1,
      lowPassLast: lowPass4
    };
  }, [audioContext, analyserNode, filterSettings]);

  // Play audio with looping
  const play = useCallback(async () => {
    if (!audioContext || !currentAudioBuffer || !analyserNode) {
      console.error('Audio not ready for playback');
      return;
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
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

    // Setup audio chain with proper connections to speakers
    if (filterSettings.enabled) {
      const filters = setupFilters();
      if (filters) {
        // Audio chain: source -> high-pass filters (4x) -> low-pass filters (4x) -> analyser -> speakers
        source.connect(filters.highPassFirst);
        filters.highPassLast.connect(filters.lowPassFirst);
        filters.lowPassLast.connect(analyserNode);
        analyserNode.connect(audioContext.destination);

        console.log('Filter chain active:',
          'High-pass at', filterSettings.highPassCutoff, 'Hz (4th order, -48dB/octave)',
          'Low-pass at', filterSettings.lowPassCutoff, 'Hz (4th order, -48dB/octave)');
      } else {
        source.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
      }
    } else {
      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
    }

    // Start playback
    source.start(0);
    setPlaybackState(PlaybackState.PLAYING);

    console.log('Playback started. Audio buffer:', currentAudioBuffer.length, 'samples,', currentAudioBuffer.duration, 'seconds');
  }, [audioContext, currentAudioBuffer, analyserNode, filterSettings, loopEnabled, setupFilters, setPlaybackState]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (err) {
        console.warn('Error stopping source:', err);
      }
      sourceNodeRef.current = null;
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

  // Update all filters in real-time when settings change
  useEffect(() => {
    if (filterSettings.enabled) {
      // Update all high-pass filters
      highPassFiltersRef.current.forEach(filter => {
        if (filter) {
          filter.frequency.value = filterSettings.highPassCutoff;
        }
      });

      // Update all low-pass filters
      lowPassFiltersRef.current.forEach(filter => {
        if (filter) {
          filter.frequency.value = filterSettings.lowPassCutoff;
        }
      });
    }
  }, [filterSettings]);

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
