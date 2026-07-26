// FitSync Hook: useFriendActivity
// Fetches combined activities feed streams from friends list

import { useState, useEffect, useCallback } from 'react';
import { ActivityService, type FriendActivityItem } from '../services/activity';

export const useFriendActivity = (userId?: string) => {
  const [feed, setFeed] = useState<FriendActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await ActivityService.getFriendActivityFeed(userId);
      setFeed(data);
    } catch (err) {
      console.error('Failed to load activity feed:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const logActivity = async (type: string, content: string, data?: any) => {
    if (!userId) return;
    try {
      await ActivityService.logActivity(userId, type, content, data);
      await fetchFeed();
    } catch (err) {
      console.error('Failed to log feed activity:', err);
    }
  };

  return {
    feed,
    loading,
    logActivity,
    refetch: fetchFeed
  };
};

export default useFriendActivity;
