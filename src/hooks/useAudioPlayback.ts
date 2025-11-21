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
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const lowPassFilterRef = useRef<BiquadFilterNode | null>(null);

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

  // Create and configure filters
  const setupFilters = useCallback(() => {
    if (!audioContext || !analyserNode) return null;

    // High-pass filter
    const highPass = audioContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = filterSettings.highPassCutoff;

    // Low-pass filter
    const lowPass = audioContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = filterSettings.lowPassCutoff;

    filterNodeRef.current = highPass;
    lowPassFilterRef.current = lowPass;

    return { highPass, lowPass };
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
        source.connect(filters.highPass);
        filters.highPass.connect(filters.lowPass);
        filters.lowPass.connect(analyserNode);
        // Connect analyser to destination (speakers) - this was missing!
        analyserNode.connect(audioContext.destination);
      } else {
        source.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
      }
    } else {
      source.connect(analyserNode);
      // Connect analyser to destination (speakers) - this was missing!
      analyserNode.connect(audioContext.destination);
    }

    // Start playback
    source.start(0);
    setPlaybackState(PlaybackState.PLAYING);

    console.log('Playback started. Audio buffer:', currentAudioBuffer.length, 'samples,', currentAudioBuffer.duration, 'seconds');
  }, [audioContext, currentAudioBuffer, analyserNode, filterSettings, setupFilters, setPlaybackState]);

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

    // Disconnect filters if they exist
    if (filterNodeRef.current) {
      try {
        filterNodeRef.current.disconnect();
      } catch (err) {
        console.warn('Error disconnecting highpass filter:', err);
      }
    }
    if (lowPassFilterRef.current) {
      try {
        lowPassFilterRef.current.disconnect();
      } catch (err) {
        console.warn('Error disconnecting lowpass filter:', err);
      }
    }

    setPlaybackState(PlaybackState.STOPPED);
  }, [setPlaybackState]);

  const pause = useCallback(() => {
    if (audioContext && playbackState === PlaybackState.PLAYING) {
      audioContext.suspend();
      setPlaybackState(PlaybackState.PAUSED);
    }
  }, [audioContext, playbackState, setPlaybackState]);

  const resume = useCallback(async () => {
    if (audioContext && playbackState === PlaybackState.PAUSED) {
      await audioContext.resume();
      setPlaybackState(PlaybackState.PLAYING);
    }
  }, [audioContext, playbackState, setPlaybackState]);

  // Update filters in real-time
  useEffect(() => {
    if (filterNodeRef.current && filterSettings.enabled) {
      filterNodeRef.current.frequency.value = filterSettings.highPassCutoff;
    }
    if (lowPassFilterRef.current && filterSettings.enabled) {
      lowPassFilterRef.current.frequency.value = filterSettings.lowPassCutoff;
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
