// FitSync Hook: useWorkouts
// Manages loading catalog workouts, searching by title/muscle groups, and filtering categories/difficulty levels

import { useState, useEffect, useCallback } from 'react';
import { WorkoutService, type Workout } from '../services/workout';

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await WorkoutService.getWorkouts();
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to load workout library:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    loading,
    refetch: fetchWorkouts
  };
};

export default useWorkouts;
