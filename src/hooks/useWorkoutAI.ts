// FitSync Hook: useWorkoutAI
// Coordinates states and submissions for generating custom workout routines

import { useState } from 'react';
import { WorkoutAIService, type WorkoutGenerationSpecs } from '../services/ai/workoutAIService';

export const useWorkoutAI = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generateWorkout = async (specs: WorkoutGenerationSpecs) => {
    if (!userId) return;
    try {
      setLoading(true);
      const routine = await WorkoutAIService.generateWorkout(userId, specs);
      setResult(routine);
      return routine;
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => setResult(null);

  return {
    generateWorkout,
    result,
    loading,
    clearResult
  };
};

export default useWorkoutAI;
