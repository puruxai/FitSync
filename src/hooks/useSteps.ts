// FitSync Hook: useSteps
// Handles logging steps, deleting logs, and querying daily/weekly/monthly history lists

import { useState, useEffect, useCallback } from 'react';
import { StepService, type StepLog } from '../services/step';
import toast from 'react-hot-toast';

export const useSteps = (userId?: string) => {
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSteps = useCallback(async (range: 'day' | 'week' | 'month' | 'year' = 'week') => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await StepService.getStepLogs(userId, range);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load steps.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const logSteps = async (steps: number, caloriesBurned?: number, dateStr?: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await StepService.logSteps(userId, steps, caloriesBurned, dateStr);
      toast.success(`Logged ${steps.toLocaleString()} steps!`, { icon: '🏃' });
      await fetchSteps();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log steps.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStepLog = async (logId: string) => {
    try {
      setLoading(true);
      await StepService.deleteStepLog(logId);
      toast.success('Step log removed.');
      setLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete step log.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    loading,
    error,
    logSteps,
    deleteStepLog,
    refetch: fetchSteps
  };
};

export default useSteps;
