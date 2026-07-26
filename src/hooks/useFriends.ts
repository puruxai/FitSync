// FitSync Hook: useFriends
// Exposes friends listings, mutual friends, and unfriend/favorite methods

import { useState, useEffect, useCallback } from 'react';
import { FriendService } from '../services/friend';
import type { Friend, UserProfile } from '../types';
import toast from 'react-hot-toast';

export const useFriends = (userId?: string) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await FriendService.getFriends(userId);
      setFriends(data);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const removeFriend = async (friendId: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      await FriendService.removeFriend(userId, friendId);
      toast.success('Friend removed.');
      setFriends(prev => prev.filter(f => f.friend_id !== friendId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove friend.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (friendshipId: string, isFav: boolean) => {
    try {
      await FriendService.toggleFavoriteFriend(friendshipId, isFav);
      setFriends(prev => prev.map(f => f.id === friendshipId ? { ...f, favorite: isFav } : f));
      toast.success(isFav ? 'Added to favorites!' : 'Removed from favorites.');
    } catch {
      toast.error('Failed to update favorite status.');
    }
  };

  const getMutualFriends = async (friendId: string): Promise<UserProfile[]> => {
    if (!userId) return [];
    try {
      return await FriendService.getMutualFriends(userId, friendId);
    } catch {
      return [];
    }
  };

  return {
    friends,
    loading,
    removeFriend,
    toggleFavorite,
    getMutualFriends,
    refetch: fetchFriends
  };
};

export default useFriends;
