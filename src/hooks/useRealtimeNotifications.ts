// FitSync Hook: useRealtimeNotifications
// Syncs and displays system notifications instantly using Supabase realtime channels

import { useState, useEffect, useCallback } from 'react';
import { ChannelService } from '../services/channel';
import { RealtimeNotificationService, type FriendNotification } from '../services/realtimeNotification';
import toast from 'react-hot-toast';

export const useRealtimeNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<FriendNotification[]>([]);

  const fetchNotifs = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await RealtimeNotificationService.getNotifications(userId);
      setNotifications(data);
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  useEffect(() => {
    if (!userId) return;

    const sub = ChannelService.subscribeNotifications(userId, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      toast(newNotif.title + ': ' + newNotif.message, {
        icon: newNotif.type?.includes('accept') ? '🏆' : '🔔',
        duration: 4000
      });
    });

    return () => {
      sub.unsubscribe();
    };
  }, [userId, fetchNotifs]);

  const markAsRead = async (id: string) => {
    try {
      await RealtimeNotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch {}
  };

  return {
    notifications,
    markAsRead,
    refetch: fetchNotifs
  };
};

export default useRealtimeNotifications;
