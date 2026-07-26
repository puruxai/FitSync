// FitSync Hook: useWorkout (Dual Mode)
// Supports single workout details queries and manual history logging queries

import { useState, useEffect, useCallback } from 'react';
import { WorkoutService, type Workout, type WorkoutLog } from '../services/workout';
import { ExerciseService, type Exercise } from '../services/exercise';

export const useWorkout = (idOrUserId?: string, userId?: string) => {
  // Details Mode states
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // History Mode states
  const [history, setHistory] = useState<WorkoutLog[]>([]);

  const [loading, setLoading] = useState(false);

  // Determine mode
  // Details mode if userId is present or idOrUserId is a workout ID (starts with 'w-')
  const isDetailsMode = !!userId || (idOrUserId && (idOrUserId.startsWith('w-') || idOrUserId.length > 20));

  const loadData = useCallback(async () => {
    if (!idOrUserId) return;
    try {
      setLoading(true);
      if (isDetailsMode) {
        // Details mode
        const wk = await WorkoutService.getWorkoutById(idOrUserId);
        setWorkout(wk);

        const exList = await ExerciseService.getExercises(idOrUserId);
        setExercises(exList);

        if (userId) {
          await WorkoutService.addToRecent(userId, idOrUserId);
        }
      } else {
        // History mode
        const logs = await WorkoutService.getWorkoutHistory(idOrUserId);
        setHistory(logs);
      }
    } catch (err) {
      console.error('Failed in useWorkout hook:', err);
    } finally {
      setLoading(false);
    }
  }, [idOrUserId, userId, isDetailsMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // History mode actions
  const logWorkout = async (details: any) => {
    if (isDetailsMode || !idOrUserId) return;
    const res = await WorkoutService.logWorkout(idOrUserId, {
      name: details.workout_name || details.name,
      category: details.category,
      duration_minutes: details.duration_minutes,
      calories_burned: details.calories_burned,
      intensity: details.intensity || 'medium',
      notes: details.notes,
      date: details.date
    });
    await loadData();
    return res;
  };

  const deleteWorkoutLog = async (logId: string) => {
    await WorkoutService.deleteWorkoutLog(logId);
    await loadData();
  };

  return {
    workout,
    exercises,
    history,
    loading,
    logWorkout,
    deleteWorkoutLog,
    refetch: loadData
  };
};

export default useWorkout;
