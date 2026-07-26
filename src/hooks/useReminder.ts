// FitSync Hook: useReminder
// Manages loading and saving active reminders list for various fitness categories

import { useState, useEffect, useCallback } from 'react';
import { ReminderService, type FitnessReminder } from '../services/reminder';

export const useReminder = (userId?: string) => {
  const [reminders, setReminders] = useState<FitnessReminder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReminders = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await ReminderService.getReminders(userId);
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const save = async (rem: FitnessReminder) => {
    if (!userId) return;
    await ReminderService.saveReminder(userId, rem);
    await fetchReminders();
  };

  const remove = async (remId: string) => {
    if (!userId) return;
    await ReminderService.deleteReminder(userId, remId);
    await fetchReminders();
  };

  return {
    reminders,
    loading,
    save,
    remove,
    refetch: fetchReminders
  };
};

export default useReminder;
