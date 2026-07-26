// FitSync Hook: useCalories
// Manages calorie consumption logs and calculates remaining balances based on daily goal targets

import { useState, useEffect, useCallback } from 'react';
import { CalorieService, type CalorieLog } from '../services/calorie';
import { GoalService } from '../services/goal';
import toast from 'react-hot-toast';

export const useCalories = (userId?: string) => {
  const [logs, setLogs] = useState<CalorieLog[]>([]);
  const [goal, setGoal] = useState(2500);
  const [loading, setLoading] = useState(false);

  const fetchCalorieDetails = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      
      const [todayLogs, goals] = await Promise.all([
        CalorieService.getCalorieLogs(userId, todayStr),
        GoalService.getGoals(userId)
      ]);

      setLogs(todayLogs);
      setGoal(goals.calories_goal);
    } catch (err) {
      console.error('Failed to load calorie stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCalorieDetails();
  }, [fetchCalorieDetails]);

  const logIntake = async (calories: number, description: string, dateStr?: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await CalorieService.logCalorie(userId, calories, 'intake', description, dateStr);
      toast.success(`Logged ${calories} kcal intake!`, { icon: '🍎' });
      await fetchCalorieDetails();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log calorie.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logBurned = async (calories: number, description: string, dateStr?: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await CalorieService.logCalorie(userId, calories, 'burned', description, dateStr);
      toast.success(`Logged ${calories} kcal burned!`, { icon: '🔥' });
      await fetchCalorieDetails();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log burned calorie.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCalorieLog = async (logId: string) => {
    try {
      setLoading(true);
      await CalorieService.deleteCalorieLog(logId);
      toast.success('Calorie entry deleted.');
      await fetchCalorieDetails();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete calorie.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const intakeTotal = logs.filter(l => l.type === 'intake').reduce((sum, l) => sum + l.calories, 0);
  const burnedTotal = logs.filter(l => l.type === 'burned').reduce((sum, l) => sum + l.calories, 0);
  const remaining = Math.max(0, goal - intakeTotal + burnedTotal);

  return {
    logs,
    goal,
    intakeTotal,
    burnedTotal,
    remaining,
    loading,
    logIntake,
    logBurned,
    deleteCalorieLog,
    refetch: fetchCalorieDetails
  };
};

export default useCalories;
