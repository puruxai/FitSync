// FitSync Hook: useGoals
// Retrieves and syncs fitness targets with automatic completion calculations

import { useState, useEffect, useCallback } from 'react';
import { GoalService, type FitnessGoals } from '../services/goal';
import toast from 'react-hot-toast';

export const useGoals = (userId?: string) => {
  const [goals, setGoals] = useState<FitnessGoals | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await GoalService.getGoals(userId);
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const updateGoals = async (updates: Partial<FitnessGoals>) => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await GoalService.updateGoals(userId, updates);
      setGoals(data);
      toast.success('Goals updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update goals.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    goals,
    loading,
    updateGoals,
    refetch: fetchGoals
  };
};

export default useGoals;
