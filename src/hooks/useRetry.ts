// FitSync Hook: useRetry
// Integrates automatic retries wrapper around async functions in React components

import { useState, useCallback } from 'react';
import { RetryService, type RetryConfig } from '../services/recovery/retry';

export const useRetry = (config?: Partial<RetryConfig>) => {
  const [attempts, setAttempts] = useState(0);
  const [running, setRunning] = useState(false);

  const execute = useCallback(async <T>(taskFn: () => Promise<T>): Promise<T> => {
    try {
      setRunning(true);
      setAttempts((prev) => prev + 1);
      return await RetryService.runWithRetry(taskFn, config);
    } finally {
      setRunning(false);
    }
  }, [config]);

  return {
    execute,
    attempts,
    running
  };
};

export default useRetry;
