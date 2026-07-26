// FitSync Hook: useDietAI
// Coordinates states and submissions for generating personalized meal plans

import { useState } from 'react';
import { DietAIService, type DietGenerationSpecs } from '../services/ai/dietAIService';

export const useDietAI = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generateDietPlan = async (specs: DietGenerationSpecs) => {
    if (!userId) return;
    try {
      setLoading(true);
      const plan = await DietAIService.generateDietPlan(userId, specs);
      setResult(plan);
      return plan;
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => setResult(null);

  return {
    generateDietPlan,
    result,
    loading,
    clearResult
  };
};

export default useDietAI;
