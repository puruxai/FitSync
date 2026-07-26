// FitSync Hook: useWorkoutHistory
// Manages fetching completed workout session logs and adding new completions records

import { useState, useEffect, useCallback } from 'react';
import { WorkoutHistoryService, type WorkoutHistoryItem } from '../services/workoutHistory';

export const useWorkoutHistory = (userId?: string) => {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await WorkoutHistoryService.getHistory(userId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load workout history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const logSession = async (
    workoutId: string | undefined,
    workoutName: string,
    durationMinutes: number,
    caloriesBurned: number,
    completionPercent: number,
    exercisesCompleted: number,
    category: string
  ) => {
    if (!userId) return;
    const res = await WorkoutHistoryService.logSession(
      userId,
      workoutId,
      workoutName,
      durationMinutes,
      caloriesBurned,
      completionPercent,
      exercisesCompleted,
      category
    );
    await fetchHistory();
    return res;
  };

  return {
    history,
    loading,
    logSession,
    refetch: fetchHistory
  };
};

export default useWorkoutHistory;
