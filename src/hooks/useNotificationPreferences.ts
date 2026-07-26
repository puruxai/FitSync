// FitSync Hook: useNotificationPreferences
// Fetches, updates, and controls category-based notification mute settings

import { useState, useEffect, useCallback } from 'react';
import { PreferenceService, type NotificationPreferences } from '../services/preference';

export const useNotificationPreferences = (userId?: string) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrefs = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await PreferenceService.getPreferences(userId);
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences settings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const update = async (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id'>>) => {
    if (!userId || !preferences) return;
    try {
      await PreferenceService.updatePreferences(userId, updates);
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  return {
    preferences,
    loading,
    update,
    refetch: fetchPrefs
  };
};

export default useNotificationPreferences;
