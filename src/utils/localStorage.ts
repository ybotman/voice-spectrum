import { AudioRecording } from '../types/audio';

const RECORDINGS_KEY = 'voice-spectrum-recordings';

/**
 * Convert AudioRecording to storable format
 * Blobs need to be converted to base64 strings for localStorage
 */
const recordingToStorable = async (recording: AudioRecording) => {
  // Convert blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.readAsDataURL(recording.blob);
  });

  const base64Data = await base64Promise;

  return {
    id: recording.id,
    name: recording.name,
    blobData: base64Data,
    duration: recording.duration,
    createdAt: recording.createdAt.toISOString()
  };
};

/**
 * Convert storable format back to AudioRecording
 */
const storableToRecording = async (storable: any): Promise<AudioRecording> => {
  // Convert base64 back to blob
  const response = await fetch(storable.blobData);
  const blob = await response.blob();

  return {
    id: storable.id,
    name: storable.name,
    blob: blob,
    duration: storable.duration,
    createdAt: new Date(storable.createdAt)
  };
};

/**
 * Save recordings to localStorage
 */
export const saveRecordingsToStorage = async (recordings: AudioRecording[]) => {
  try {
    const storableRecordings = await Promise.all(
      recordings.map(recording => recordingToStorable(recording))
    );
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(storableRecordings));
    console.log('Saved', recordings.length, 'recordings to localStorage');
  } catch (err) {
    console.error('Failed to save recordings to localStorage:', err);
  }
};

/**
 * Load recordings from localStorage
 */
export const loadRecordingsFromStorage = async (): Promise<AudioRecording[]> => {
  try {
    const stored = localStorage.getItem(RECORDINGS_KEY);
    if (!stored) {
      return [];
    }

    const storableRecordings = JSON.parse(stored);
    const recordings = await Promise.all(
      storableRecordings.map((storable: any) => storableToRecording(storable))
    );
    console.log('Loaded', recordings.length, 'recordings from localStorage');
    return recordings;
  } catch (err) {
    console.error('Failed to load recordings from localStorage:', err);
    return [];
  }
};

/**
 * Clear all recordings from localStorage
 */
export const clearRecordingsFromStorage = () => {
  localStorage.removeItem(RECORDINGS_KEY);
  console.log('Cleared recordings from localStorage');
};
