// FitSync Hook: useInsights
// Fetches daily/weekly summaries, strengths analysis, and weakness notifications from AI services

import { useState, useEffect, useCallback } from 'react';
import { InsightService, type AIInsight } from '../services/ai/insightService';

export const useInsights = (userId?: string) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await InsightService.getInsights(userId);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    refetch: fetchInsights
  };
};

export default useInsights;
