import { useState, useCallback, useEffect } from 'react';
import {
  loadProgress,
  recordExamResult,
  recordFlashSession,
  resetProgress as resetProgressStorage,
} from '../utils/storage';

/**
 * Reactive wrapper around the localStorage progress store, so components
 * re-render when progress changes without needing to read localStorage
 * directly.
 */
export function useProgress() {
  const [progress, setProgress] = useState(() => loadProgress());

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const saveExamResult = useCallback((result) => {
    const updated = recordExamResult(result);
    setProgress(updated);
    return updated;
  }, []);

  const saveFlashSession = useCallback((session) => {
    const updated = recordFlashSession(session);
    setProgress(updated);
    return updated;
  }, []);

  const reset = useCallback(() => {
    const cleared = resetProgressStorage();
    setProgress(cleared);
    return cleared;
  }, []);

  return { progress, saveExamResult, saveFlashSession, reset };
}
