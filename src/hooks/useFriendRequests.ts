// FitSync Hook: useFriendRequests
// Manages sending, accepting, and rejecting pending friend requests

import { useState, useEffect, useCallback } from 'react';
import { FriendService } from '../services/friend';
import type { FriendRequest } from '../types';
import toast from 'react-hot-toast';

export const useFriendRequests = (userId?: string) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await FriendService.getFriendRequests(userId);
      setRequests(data);
    } catch (err) {
      console.error('Failed to load friend requests:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sendRequest = async (targetQuery: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await FriendService.sendFriendRequest(userId, targetQuery);
      toast.success('Friend request sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send friend request.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await FriendService.handleFriendRequest(requestId, 'accepted', userId);
      toast.success('Friend request accepted!', { icon: '🤝' });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept request.');
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await FriendService.handleFriendRequest(requestId, 'rejected', userId);
      toast.success('Friend request declined.');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline request.');
    } finally {
      setLoading(false);
    }
  };

  return {
    requests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    refetch: fetchRequests
  };
};

export default useFriendRequests;
