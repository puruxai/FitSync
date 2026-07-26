// FitSync Hook: useWeight
// Manages weight reading entries, BMI categorizations, and healthy suggest tips

import { useState, useEffect, useCallback } from 'react';
import { WeightService, type WeightLog } from '../services/weight';
import toast from 'react-hot-toast';

export const useWeight = (userId?: string, userHeightCm = 175) => {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [weightChange, setWeightChange] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWeight = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [history, change] = await Promise.all([
        WeightService.getWeightLogs(userId),
        WeightService.getWeightChange(userId)
      ]);
      setLogs(history);
      setWeightChange(change);
    } catch (err) {
      console.error('Failed to load weight:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWeight();
  }, [fetchWeight]);

  const logWeight = async (weightKg: number, dateStr?: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      // BMI = Weight(kg) / Height(m)^2
      const heightInMeters = userHeightCm / 100;
      const bmi = Number((weightKg / (heightInMeters * heightInMeters)).toFixed(2));
      
      await WeightService.logWeight(userId, weightKg, bmi, dateStr);
      toast.success(`Weight logged: ${weightKg} kg (BMI: ${bmi})!`, { icon: '⚖️' });
      await fetchWeight();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log weight.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWeightLog = async (logId: string) => {
    try {
      setLoading(true);
      await WeightService.deleteWeightLog(logId);
      toast.success('Weight entry deleted.');
      setLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete weight log.');
    } finally {
      setLoading(false);
    }
  };

  // BMI calculations helper
  const latestBmi = logs.length > 0 ? logs[0].bmi : 22.0;
  
  const getBmiCategory = (score: number) => {
    if (score < 18.5) return { label: 'Underweight', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (score < 25) return { label: 'Normal Weight', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (score < 30) return { label: 'Overweight', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const getBmiSuggestions = (score: number) => {
    if (score < 18.5) {
      return 'Focus on lean mass build-ups with caloric surplus training and resistance workouts.';
    }
    if (score < 25) {
      return 'Great job! Maintain active routines with balanced steps and workouts daily.';
    }
    if (score < 30) {
      return 'Target a slight calorie deficit (e.g. -200kcal) and increase HIIT cardio workouts.';
    }
    return 'Seek advice on deficit goal planning and incorporate low-impact cardio sessions.';
  };

  const bmiCategory = getBmiCategory(latestBmi);
  const bmiSuggestion = getBmiSuggestions(latestBmi);

  return {
    logs,
    weightChange,
    latestBmi,
    bmiCategory,
    bmiSuggestion,
    loading,
    logWeight,
    deleteWeightLog,
    refetch: fetchWeight
  };
};

export default useWeight;
