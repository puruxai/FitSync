// FitSync Hook: useRealtimeLeaderboard
// Updates user leaderboard score lists instantly upon fitness updates

import { useState, useEffect, useCallback } from 'react';
import { ChannelService } from '../services/channel';
import { LeaderboardService } from '../services/leaderboard';
import type { LeaderboardEntry } from '../types';

export const useRealtimeLeaderboard = (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await LeaderboardService.getLeaderboard(period);
      setLeaderboard(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  useEffect(() => {
    const sub = ChannelService.subscribeLeaderboard(() => {
      fetchRankings();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [fetchRankings]);

  return {
    leaderboard,
    loading,
    refetch: fetchRankings
  };
};

export default useRealtimeLeaderboard;
