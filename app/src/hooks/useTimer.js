import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Countdown timer hook used by Exam Mode.
 * @param {number} durationSeconds - total countdown duration in seconds
 * @param {() => void} onExpire - called once when the timer reaches 0
 */
export function useTimer(durationSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const reset = useCallback((newDuration = durationSeconds) => {
    setSecondsLeft(newDuration);
    setIsRunning(true);
  }, [durationSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { secondsLeft, formatted, isRunning, pause, resume, reset };
}
