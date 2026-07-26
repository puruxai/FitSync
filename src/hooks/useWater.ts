// FitSync Hook: useWater
// Manages water logs history and quick add ml buttons

import { useState, useEffect, useCallback } from 'react';
import { WaterService, type WaterLog } from '../services/water';
import { GoalService } from '../services/goal';
import toast from 'react-hot-toast';

export const useWater = (userId?: string) => {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [goal, setGoal] = useState(2500);
  const [loading, setLoading] = useState(false);

  const fetchWater = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [waterLogs, goals] = await Promise.all([
        WaterService.getWaterLogs(userId),
        GoalService.getGoals(userId)
      ]);
      setLogs(waterLogs);
      setGoal(goals.water_ml_goal);
    } catch (err) {
      console.error('Failed to load water logs:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWater();
  }, [fetchWater]);

  const logWater = async (amountMl: number, dateStr?: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await WaterService.logWater(userId, amountMl, dateStr);
      toast.success(`Added ${amountMl} ml of water!`, { icon: '💧' });
      await fetchWater();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log water.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWaterLog = async (logId: string) => {
    try {
      setLoading(true);
      await WaterService.deleteWaterLog(logId);
      toast.success('Water log removed.');
      setLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete log.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = logs.filter(l => l.date === todayStr).reduce((sum, l) => sum + l.amount_ml, 0);

  return {
    logs,
    goal,
    todayTotal,
    loading,
    logWater,
    deleteWaterLog,
    refetch: fetchWater
  };
};

export default useWater;
