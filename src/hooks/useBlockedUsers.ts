// FitSync Hook: useBlockedUsers
// Manages adding, removing, and viewing blocked profiles lists

import { useState, useEffect, useCallback } from 'react';
import { BlockService } from '../services/block';
import type { UserProfile } from '../types';
import toast from 'react-hot-toast';

export const useBlockedUsers = (userId?: string) => {
  const [blockedList, setBlockedList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlocked = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await BlockService.getBlockedList(userId);
      setBlockedList(data);
    } catch (err) {
      console.error('Failed to load blocked users:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const blockUser = async (targetId: string, name = 'User') => {
    if (!userId) return;
    try {
      setLoading(true);
      await BlockService.blockUser(userId, targetId);
      toast.success(`${name} has been blocked.`);
      await fetchBlocked();
    } catch (err: any) {
      toast.error(err.message || 'Failed to block user.');
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (targetId: string, name = 'User') => {
    if (!userId) return;
    try {
      setLoading(true);
      await BlockService.unblockUser(userId, targetId);
      toast.success(`${name} unblocked.`);
      setBlockedList(prev => prev.filter(p => p.id !== targetId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to unblock user.');
    } finally {
      setLoading(false);
    }
  };

  return {
    blockedList,
    loading,
    blockUser,
    unblockUser,
    refetch: fetchBlocked
  };
};

export default useBlockedUsers;
