// FitSync Hook: useAI
// Manages loading and updating the active AI provider, model type, memory preferences, and api keys configurations

import { useState, useEffect, useCallback } from 'react';
import { AIProviderService, type AISettings } from '../services/ai/aiProviderService';

export const useAI = (userId?: string) => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const s = await AIProviderService.getSettings(userId);
      setSettings(s);
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<Omit<AISettings, 'profile_id'>>) => {
    if (!userId) return;
    try {
      setLoading(true);
      const s = await AIProviderService.updateSettings(userId, updates);
      setSettings(s);
      return s;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
};

export default useAI;
