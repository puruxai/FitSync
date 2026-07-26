// FitSync Hook: useChallengeInvites
// Manages querying pending challenge invitations and sending invites to friends

import { useState, useEffect, useCallback } from 'react';
import { ChallengeInviteService, type ChallengeInvite } from '../services/challengeInvite';

export const useChallengeInvites = (userId?: string) => {
  const [invites, setInvites] = useState<ChallengeInvite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvites = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await ChallengeInviteService.getInvites(userId);
      setInvites(data);
    } catch (err) {
      console.error('Failed to load invites:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const accept = async (inviteId: string) => {
    if (!userId) return;
    try {
      await ChallengeInviteService.acceptInvite(inviteId, userId);
      await fetchInvites();
    } catch (err) {
      console.error('Failed to accept invite:', err);
    }
  };

  const reject = async (inviteId: string) => {
    try {
      await ChallengeInviteService.rejectInvite(inviteId);
      await fetchInvites();
    } catch (err) {
      console.error('Failed to reject invite:', err);
    }
  };

  const send = async (challengeId: string, friendId: string) => {
    if (!userId) return;
    return ChallengeInviteService.sendInvite(challengeId, userId, friendId);
  };

  return {
    invites,
    loading,
    accept,
    reject,
    send,
    refetch: fetchInvites
  };
};

export default useChallengeInvites;
