// FitSync Hook: useStatistics
// Loads user activity averages (avg steps, calories, best day of week, consistency indices)

import { useState, useEffect, useCallback } from 'react';
import { StatisticsService, type UserStatsSummary } from '../services/statistics';

export const useStatistics = (userId?: string) => {
  const [stats, setStats] = useState<UserStatsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await StatisticsService.getStatistics(userId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};

export default useStatistics;
