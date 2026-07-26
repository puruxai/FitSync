// FitSync Hook: useRealtimeFitness
// Subscribes to realtime step, water, and workout table changes for instant dashboard synchronization

import { useState, useEffect, useCallback } from 'react';
import { ChannelService } from '../services/channel';
import { FitnessService } from '../services/fitness';

export const useRealtimeFitness = (userId?: string) => {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [water, setWater] = useState(0);
  const [workoutMin, setWorkoutMin] = useState(0);

  const fetchTodayData = useCallback(async () => {
    if (!userId) return;
    try {
      const today = await FitnessService.getTodayLog(userId);
      setSteps(today.steps);
      setCalories(today.calories);
      setWater(today.water);
      setWorkoutMin(today.workout_minutes);
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  // Subscribe to postgres database channel updates
  useEffect(() => {
    if (!userId) return;

    const sub = ChannelService.subscribeFitness(userId, () => {
      // Reload today's aggregates on any changes
      fetchTodayData();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [userId, fetchTodayData]);

  return {
    steps,
    calories,
    water,
    workoutMin,
    setSteps,
    setCalories,
    setWater,
    setWorkoutMin,
    refetch: fetchTodayData
  };
};

export default useRealtimeFitness;
