// FitSync Hook: useUnreadNotifications
// Returns a live unread notifications counter mapping to realtime channels updates

import { useState, useEffect } from 'react';
import { useNotifications } from './useNotifications';

export const useUnreadNotifications = (userId?: string) => {
  const { notifications, loading, refetch } = useNotifications(userId);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter(n => !n.is_read && !n.is_archived).length;
    setUnreadCount(unread);
  }, [notifications]);

  return {
    unreadCount,
    loading,
    refetch
  };
};

export default useUnreadNotifications;
