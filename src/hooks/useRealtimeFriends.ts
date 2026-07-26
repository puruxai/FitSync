// FitSync Hook: useRealtimeFriends
// Listens to friend request additions and established connection updates instantly

import { useState, useEffect, useCallback } from 'react';
import { ChannelService } from '../services/channel';
import { FriendService } from '../services/friend';
import type { Friend, FriendRequest } from '../types';

export const useRealtimeFriends = (userId?: string) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const fetchFriendData = useCallback(async () => {
    if (!userId) return;
    try {
      const [fList, reqList] = await Promise.all([
        FriendService.getFriends(userId),
        FriendService.getFriendRequests(userId)
      ]);
      setFriends(fList);
      setRequests(reqList);
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchFriendData();
  }, [fetchFriendData]);

  useEffect(() => {
    if (!userId) return;

    const sub = ChannelService.subscribeFriends(userId, () => {
      fetchFriendData();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [userId, fetchFriendData]);

  return {
    friends,
    requests,
    refetch: fetchFriendData
  };
};

export default useRealtimeFriends;
