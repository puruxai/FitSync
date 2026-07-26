// FitSync Hook: useProfileStats
// Fetches, updates, and recalculates profile statistics (BMI, streak, step averages)

import { useState, useEffect, useCallback } from 'react';
import { ProfileService, type ProfileStats } from '../services/profile';
import toast from 'react-hot-toast';

export const useProfileStats = (userId?: string) => {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (forceRecalc = false) => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      
      let data: ProfileStats;
      if (forceRecalc) {
        data = await ProfileService.recalculateProfileStats(userId);
      } else {
        data = await ProfileService.getProfileStats(userId);
      }
      
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const recalculate = async () => {
    await fetchStats(true);
    toast.success('Statistics updated!', { icon: '📊' });
  };

  return {
    stats,
    loading,
    error,
    recalculate,
    refetch: () => fetchStats()
  };
};

export default useProfileStats;
