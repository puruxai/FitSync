// FitSync Hook: useFitness
// Retrieves consolidated daily logs, stats summary, and streaks data

import { useState, useEffect, useCallback } from 'react';
import { FitnessService, type FitnessStatistics } from '../services/fitness';
import type { FitnessLog } from '../types';

export const useFitness = (userId?: string) => {
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [stats, setStats] = useState<FitnessStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFitnessOverview = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [history, statistics] = await Promise.all([
        FitnessService.getFitnessLogs(userId),
        FitnessService.getFitnessStatistics(userId)
      ]);
      setLogs(history);
      setStats(statistics);
    } catch (err) {
      console.error('Failed to load fitness overview:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFitnessOverview();
  }, [fetchFitnessOverview]);

  const recalculateStats = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const updated = await FitnessService.recalculateFitnessStatistics(userId);
      setStats(updated);
    } catch (err) {
      console.error('Failed to recalculate fitness stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    stats,
    loading,
    recalculateStats,
    refetch: fetchFitnessOverview
  };
};

export default useFitness;
