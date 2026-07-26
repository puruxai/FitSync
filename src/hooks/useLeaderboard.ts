// FitSync Hook: useLeaderboard
// Fetches filter-based leaderboard scores and syncs them live on database broadcasts

import { useState, useEffect, useCallback } from 'react';
import { LeaderboardService, type LeaderboardScore, type LeaderboardFilters } from '../services/leaderboard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const useLeaderboard = (userId?: string, initialFilters?: Partial<LeaderboardFilters>) => {
  const [filters, setFilters] = useState<LeaderboardFilters>({
    category: 'steps',
    period: 'weekly',
    scope: 'global',
    limit: 25,
    offset: 0,
    ...initialFilters
  });

  const [rankings, setRankings] = useState<LeaderboardScore[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRankings = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await LeaderboardService.getRankings(userId, filters);
      setRankings(data);
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Set up real-time postgres listener updates
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel('live-leaderboards-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard_scores' },
        () => {
          // Live refresh rankings when anyone submits a score
          fetchRankings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchRankings]);

  const updateFilters = (newFilters: Partial<LeaderboardFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return {
    rankings,
    filters,
    loading,
    updateFilters,
    refetch: fetchRankings
  };
};

export default useLeaderboard;
