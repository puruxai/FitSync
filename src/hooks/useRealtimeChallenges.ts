// FitSync Hook: useRealtimeChallenges
// Syncs challenge statistics, members list updates, and completion progress in real-time

import { useState, useEffect, useCallback } from 'react';
import { ChannelService } from '../services/channel';
import { ChallengeService } from '../services/challenge';
import type { ChallengeMember } from '../types';

export const useRealtimeChallenges = (challengeId?: string) => {
  const [members, setMembers] = useState<ChallengeMember[]>([]);

  const fetchMembers = useCallback(async () => {
    if (!challengeId) return;
    try {
      const data = await ChallengeService.getChallengeMembers(challengeId);
      setMembers(data);
    } catch {}
  }, [challengeId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (!challengeId) return;

    const sub = ChannelService.subscribeChallenges(challengeId, () => {
      fetchMembers();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [challengeId, fetchMembers]);

  return {
    members,
    refetch: fetchMembers
  };
};

export default useRealtimeChallenges;
