// FitSync Hook: useFitnessAnalytics
// Triggers score calculations and coordinates datasets for Recharts area, radar, and line charts

import { useState, useEffect, useCallback } from 'react';
import { FitnessAnalyticsService, type FitnessScoreData } from '../services/fitnessAnalytics';

export const useFitnessAnalytics = (userId?: string) => {
  const [scoreData, setScoreData] = useState<FitnessScoreData | null>(null);
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScoreDetails = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await FitnessAnalyticsService.calculateFitnessScore(userId);
      setScoreData(data);

      const history = await FitnessAnalyticsService.getScoreHistory(userId);
      setScoreHistory(history);
    } catch (err) {
      console.error('Failed to calculate score details:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScoreDetails();
  }, [fetchScoreDetails]);

  return {
    scoreData,
    scoreHistory,
    loading,
    refetch: fetchScoreDetails
  };
};

export default useFitnessAnalytics;
