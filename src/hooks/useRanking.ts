// FitSync Hook: useRanking
// Retrieves and formats the current user's specific leaderboard standing, best rank, and trend indicator

import { useState, useEffect, useCallback } from 'react';
import { LeaderboardService, type LeaderboardScore, type LeaderboardFilters } from '../services/leaderboard';

export const useRanking = (
  userId?: string,
  category: LeaderboardFilters['category'] = 'steps',
  period: LeaderboardFilters['period'] = 'weekly'
) => {
  const [userScore, setUserScore] = useState<LeaderboardScore | null>(null);
  const [userRank, setUserRank] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const fetchUserRanking = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const list = await LeaderboardService.getRankings(userId, {
        category,
        period,
        scope: 'global',
        limit: 100 // Look within top 100
      });

      const idx = list.findIndex(item => item.user_id === userId);
      if (idx !== -1) {
        setUserScore(list[idx]);
        setUserRank(idx + 1);
      } else {
        setUserScore(null);
        setUserRank(-1);
      }
    } catch (err) {
      console.error('Failed to load user ranking:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, category, period]);

  useEffect(() => {
    fetchUserRanking();
  }, [fetchUserRanking]);

  return {
    userScore,
    userRank,
    loading,
    refetch: fetchUserRanking
  };
};

export default useRanking;
