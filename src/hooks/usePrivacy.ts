// FitSync Hook: usePrivacy
// Handles fetching, caching, and updating granular user profile privacy settings

import { useState, useEffect, useCallback } from 'react';
import { PrivacyService, type PrivacySettings } from '../services/privacy';

export const usePrivacy = (userId?: string) => {
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrivacy = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await PrivacyService.getPrivacy(userId);
      setPrivacy(data);
    } catch (err) {
      console.error('Failed to load privacy settings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrivacy();
  }, [fetchPrivacy]);

  const updatePrivacy = async (updates: Partial<Omit<PrivacySettings, 'profile_id' | 'updated_at'>>) => {
    if (!userId) return;
    try {
      setLoading(true);
      const updated = await PrivacyService.updatePrivacy(userId, updates);
      setPrivacy(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  return {
    privacy,
    loading,
    updatePrivacy,
    refetch: fetchPrivacy
  };
};

export default usePrivacy;
