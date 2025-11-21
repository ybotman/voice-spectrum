import { useState, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/audioStore';
import { RecordingState, AudioRecording } from '../types/audio';
import { useAudioContext } from './useAudioContext';

export const useAudioRecorder = () => {
  const {
    recordingState,
    setRecordingState,
    setCurrentRecording,
    addRecording
  } = useAudioStore();

  const { audioContext, analyserNode } = useAudioContext();

  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Request microphone access with constraints to prevent clipping
      // Note: Not all browsers/devices support all constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,  // Disable for pure audio capture
          noiseSuppression: false,  // Disable to keep natural harmonics
          autoGainControl: false,   // CRITICAL: Disable AGC to prevent distortion
          sampleRate: 48000         // Higher sample rate for better quality
        }
      });

      // Connect microphone to analyser for real-time visualization
      // Add a gain node to control input level and prevent clipping
      let gainNode: GainNode | null = null;
      if (audioContext && analyserNode) {
        const source = audioContext.createMediaStreamSource(stream);

        // Create gain node to reduce input level (prevent clipping)
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5; // Reduce to 50% to prevent clipping

        source.connect(gainNode);
        gainNode.connect(analyserNode);
        sourceNodeRef.current = source;

        console.log('Microphone connected with gain control (50%) to prevent clipping');
        console.log('Audio constraints: AGC=off, NoiseSuppression=off, EchoCancellation=off');
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Data chunk received:', event.data.size, 'bytes, type:', event.data.type);
          audioChunksRef.current.push(event.data);
        } else {
          console.warn('Received empty data chunk');
        }
      };

      // Handle recording errors
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error);
        setError(`Recording error: ${event.error?.message || 'Unknown error'}`);
      };

      // Handle stop
      mediaRecorder.onstop = () => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const mimeType = mediaRecorder.mimeType || 'audio/webm';

        console.log('Recording stopped. Chunks captured:', audioChunksRef.current.length);

        // Log each chunk size
        audioChunksRef.current.forEach((chunk, index) => {
          console.log(`  Chunk ${index}: ${chunk.size} bytes, type: ${chunk.type}`);
        });

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Final blob size:', audioBlob.size, 'bytes, type:', audioBlob.type, 'duration:', duration.toFixed(2), 's');

        const recording: AudioRecording = {
          id: `recording-${Date.now()}`,
          name: `Recording ${new Date().toLocaleTimeString()}`,
          blob: audioBlob,
          duration,
          createdAt: new Date()
        };

        setCurrentRecording(recording);
        addRecording(recording);

        // Disconnect microphone from analyser
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Reset recording state to IDLE so we can record again
        setRecordingState(RecordingState.IDLE);
        console.log('Recording complete. State reset to IDLE. Ready to record again.');
      };

      // Start recording with timeslice to ensure data is captured periodically
      // Request data every 100ms to ensure we capture audio
      mediaRecorder.start(100);
      setRecordingState(RecordingState.RECORDING);

      console.log('MediaRecorder started. State:', mediaRecorder.state, 'MIME type:', mediaRecorder.mimeType);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, [setRecordingState, setCurrentRecording, addRecording, audioContext, analyserNode]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (recordingState === RecordingState.RECORDING || recordingState === RecordingState.PAUSED)) {
      mediaRecorderRef.current.stop();
      // State will be set to IDLE in onstop handler
    }
  }, [recordingState]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RecordingState.RECORDING) {
      mediaRecorderRef.current.pause();
      setRecordingState(RecordingState.PAUSED);
    }
  }, [recordingState, setRecordingState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RecordingState.PAUSED) {
      mediaRecorderRef.current.resume();
      setRecordingState(RecordingState.RECORDING);
    }
  }, [recordingState, setRecordingState]);

  return {
    recordingState,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};
