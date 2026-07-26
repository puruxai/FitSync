import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/profile';
import type { UserProfile } from '../types';
import toast from 'react-hot-toast';

export const useProfile = (profileId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ProfileService.getProfile(profileId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (details: Partial<UserProfile>) => {
    if (!profileId) return;
    try {
      setLoading(true);
      const updated = await ProfileService.updateProfile(profileId, details);
      setProfile(updated);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to update profile.';
      toast.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchProfiles = async (query: string): Promise<UserProfile[]> => {
    try {
      return await ProfileService.searchProfiles(query);
    } catch (err: any) {
      toast.error(err.message || 'Failed to search users.');
      return [];
    }
  };

  const checkUsername = async (username: string, userId: string): Promise<boolean> => {
    try {
      return await ProfileService.checkUsernameAvailability(username, userId);
    } catch {
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    searchProfiles,
    checkUsername,
    refetch: fetchProfile
  };
};

export default useProfile;
