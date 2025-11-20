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
      const arrayBuffer = await recording.blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
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
    source.loop = true; // Enable looping
    sourceNodeRef.current = source;

    // Setup audio chain
    if (filterSettings.enabled) {
      const filters = setupFilters();
      if (filters) {
        source.connect(filters.highPass);
        filters.highPass.connect(filters.lowPass);
        filters.lowPass.connect(analyserNode);
      } else {
        source.connect(analyserNode);
      }
    } else {
      source.connect(analyserNode);
    }

    // Start playback
    source.start(0);
    setPlaybackState(PlaybackState.PLAYING);
  }, [audioContext, currentAudioBuffer, analyserNode, filterSettings, setupFilters, setPlaybackState]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
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
