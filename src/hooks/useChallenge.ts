// FitSync Hook: useChallenge
// Loads specific challenge detail records, participant profiles lists, and supports join/leave triggers

import { useState, useEffect, useCallback } from 'react';
import { ChallengeService, type ChallengeMember } from '../services/challenge';

export const useChallenge = (challengeId?: string, userId?: string) => {
  const [members, setMembers] = useState<ChallengeMember[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!challengeId) return;
    try {
      setLoading(true);
      const list = await ChallengeService.getChallengeMembers(challengeId);
      setMembers(list);
      setHasJoined(list.some(m => m.user_id === userId));
    } catch (err) {
      console.error('Failed to load challenge members:', err);
    } finally {
      setLoading(false);
    }
  }, [challengeId, userId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const join = async () => {
    if (!challengeId || !userId) return;
    try {
      await ChallengeService.joinChallenge(challengeId, userId);
      await fetchMembers();
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
  };

  const leave = async () => {
    if (!challengeId || !userId) return;
    try {
      await ChallengeService.leaveChallenge(challengeId, userId);
      await fetchMembers();
    } catch (err) {
      console.error('Failed to leave challenge:', err);
    }
  };

  return {
    members,
    hasJoined,
    loading,
    join,
    leave,
    refetch: fetchMembers
  };
};

export default useChallenge;
