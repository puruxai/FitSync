// FitSync Hook: useProfilePrivacy
// Loads and manages the profile privacy configurations (visibility levels, metric lock toggles)

import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/profile';
import type { PrivacySettings } from '../types';
import toast from 'react-hot-toast';

export const useProfilePrivacy = (userId?: string) => {
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrivacy = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ProfileService.getProfilePrivacy(userId);
      setPrivacy(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load privacy settings.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrivacy();
  }, [fetchPrivacy]);

  const updatePrivacy = async (updates: Partial<PrivacySettings>) => {
    if (!userId) return;
    try {
      setLoading(true);
      const updated = await ProfileService.updateProfilePrivacy(userId, {
        ...privacy,
        ...updates
      });
      setPrivacy(updated);
      toast.success('Privacy settings synced.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update privacy settings.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    privacy,
    loading,
    error,
    updatePrivacy,
    refetch: fetchPrivacy
  };
};

export default useProfilePrivacy;
