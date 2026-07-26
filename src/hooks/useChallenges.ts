// FitSync Hook: useChallenges
// Manages loading visible challenges feeds, creator indicators, and creation duplication commands

import { useState, useEffect, useCallback } from 'react';
import { ChallengeService, type Challenge } from '../services/challenge';

export const useChallenges = (userId?: string) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ChallengeService.getChallenges();
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const createChallenge = async (ch: Omit<Challenge, 'id' | 'created_at' | 'members_count' | 'creator_profile'>) => {
    if (!userId) return;
    const res = await ChallengeService.createChallenge(ch, userId);
    await fetchChallenges();
    return res;
  };

  const duplicateChallenge = async (challengeId: string) => {
    if (!userId) return;
    const res = await ChallengeService.duplicateChallenge(challengeId, userId);
    await fetchChallenges();
    return res;
  };

  const deleteChallenge = async (challengeId: string) => {
    await ChallengeService.deleteChallenge(challengeId);
    await fetchChallenges();
  };

  return {
    challenges,
    loading,
    createChallenge,
    duplicateChallenge,
    deleteChallenge,
    refetch: fetchChallenges
  };
};

export default useChallenges;
