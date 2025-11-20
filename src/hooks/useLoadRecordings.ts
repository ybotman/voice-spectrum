import { useEffect, useState } from 'react';
import { useAudioStore } from '../store/audioStore';
import { loadRecordingsFromStorage } from '../utils/localStorage';

/**
 * Hook to load recordings from localStorage on app startup
 */
export const useLoadRecordings = () => {
  const { setRecordings } = useAudioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecordings = async () => {
      try {
        setIsLoading(true);
        const recordings = await loadRecordingsFromStorage();
        setRecordings(recordings);
        console.log('Loaded', recordings.length, 'recordings on app startup');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recordings';
        setError(errorMessage);
        console.error('Error loading recordings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecordings();
  }, [setRecordings]);

  return { isLoading, error };
};
