import { useState, useCallback, useRef } from 'react';

const RATE_LIMIT_KEY = 'verification_rate_limit';
const MAX_REQUESTS = 3;
const TIME_WINDOW = 60 * 1000; 

interface RateLimitAttempt {
  timestamp: number;
}

export function useRateLimit() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const blockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getAttempts = useCallback((): RateLimitAttempt[] => {
    try {
      const data = localStorage.getItem(RATE_LIMIT_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, []);

  const saveAttempts = useCallback((attempts: RateLimitAttempt[]) => {
    try {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Failed to save rate limit attempts:', error);
    }
  }, []);

  const cleanupOldAttempts = useCallback((attempts: RateLimitAttempt[]): RateLimitAttempt[] => {
    const now = Date.now();
    return attempts.filter(attempt => now - attempt.timestamp < TIME_WINDOW);
  }, []);

  const checkRateLimit = useCallback((): { allowed: boolean; remainingTime?: number } => {
    if (isBlocked) {
      const attempts = getAttempts();
      const oldestAttempt = attempts[0];
      if (oldestAttempt) {
        const elapsed = Date.now() - oldestAttempt.timestamp;
        const remaining = Math.max(0, TIME_WINDOW - elapsed);
        return { allowed: false, remainingTime: remaining };
      }
    }

    let attempts = getAttempts();
    attempts = cleanupOldAttempts(attempts);

    if (attempts.length >= MAX_REQUESTS) {
      const oldestAttempt = attempts[0];
      const elapsed = Date.now() - oldestAttempt.timestamp;
      const remaining = Math.max(0, TIME_WINDOW - elapsed);

      if (remaining > 0) {
        setIsBlocked(true);
        setBlockTimeRemaining(remaining);

        if (blockTimerRef.current) {
          clearTimeout(blockTimerRef.current);
        }

        blockTimerRef.current = setTimeout(() => {
          setIsBlocked(false);
          setBlockTimeRemaining(0);
          localStorage.removeItem(RATE_LIMIT_KEY);
        }, remaining);

        return { allowed: false, remainingTime: remaining };
      } else {
        attempts = [];
        saveAttempts([]);
      }
    }

    attempts.push({ timestamp: Date.now() });
    saveAttempts(attempts);

    return { allowed: true };
  }, [isBlocked, getAttempts, cleanupOldAttempts, saveAttempts]);

  const resetRateLimit = useCallback(() => {
    if (blockTimerRef.current) {
      clearTimeout(blockTimerRef.current);
    }
    localStorage.removeItem(RATE_LIMIT_KEY);
    setIsBlocked(false);
    setBlockTimeRemaining(0);
  }, []);

  return {
    isBlocked,
    blockTimeRemaining,
    checkRateLimit,
    resetRateLimit,
  };
}
