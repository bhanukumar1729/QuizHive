import { useState, useEffect, useRef } from 'react';

/**
 * Counts down to an ISO deadline string received from the backend.
 * Calls onExpire() when time runs out.
 * Returns { timeLeft (seconds), formattedTime, isExpired }
 */
export function useQuizTimer(deadline, onExpire) {
  const [timeLeft, setTimeLeft] = useState(0);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!deadline) return;

    const calc = () => {
      const diff = Math.floor((new Date(deadline) - Date.now()) / 1000);
      return Math.max(0, diff);
    };

    setTimeLeft(calc());

    const interval = setInterval(() => {
      const remaining = calc();
      setTimeLeft(remaining);

      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return {
    timeLeft,
    formattedTime: `${m}:${s}`,
    isExpired: timeLeft === 0,
    isWarning: timeLeft > 0 && timeLeft <= 60,
  };
}
