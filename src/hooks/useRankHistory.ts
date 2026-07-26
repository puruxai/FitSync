// FitSync Hook: useRankHistory
// Retrieves historical rank logs to display ranking metrics over time in graphs

import { useState, useEffect, useCallback } from 'react';
import { RankingService, type UserRankHistory } from '../services/ranking';

export const useRankHistory = (userId?: string, period: string = 'weekly') => {
  const [history, setHistory] = useState<UserRankHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRankHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await RankingService.getUserRankHistory(userId, period);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load rank history timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    fetchRankHistory();
  }, [fetchRankHistory]);

  return {
    history,
    loading,
    refetch: fetchRankHistory
  };
};

export default useRankHistory;
