import { useState, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/audioStore';
import { RecordingState, AudioRecording } from '../types/audio';

export const useAudioRecorder = () => {
  const {
    recordingState,
    setRecordingState,
    setCurrentRecording,
    addRecording
  } = useAudioStore();

  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const duration = (Date.now() - startTimeRef.current) / 1000;

        const recording: AudioRecording = {
          id: `recording-${Date.now()}`,
          name: `Recording ${new Date().toLocaleTimeString()}`,
          blob: audioBlob,
          duration,
          createdAt: new Date()
        };

        setCurrentRecording(recording);
        addRecording(recording);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setRecordingState(RecordingState.RECORDING);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, [setRecordingState, setCurrentRecording, addRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RecordingState.RECORDING) {
      mediaRecorderRef.current.stop();
      setRecordingState(RecordingState.STOPPED);
    }
  }, [recordingState, setRecordingState]);

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
