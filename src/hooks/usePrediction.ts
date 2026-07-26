// FitSync Hook: usePrediction
// Fetches predicted weight, BMI, and step trends from prediction services

import { useState, useEffect, useCallback } from 'react';
import { PredictionService, type AIPrediction } from '../services/ai/predictionService';

export const usePrediction = (userId?: string) => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await PredictionService.getPredictions(userId);
      setPredictions(data);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    loading,
    refetch: fetchPredictions
  };
};

export default usePrediction;
