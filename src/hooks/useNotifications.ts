// FitSync Hook: useNotifications
// Fetches, paginates, searches, and controls pinning, archiving, and deletion of user notifications

import { useState, useEffect, useCallback } from 'react';
import { NotificationService, type FitNotification } from '../services/notification';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<FitNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(userId);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  // Real-time subscription sync
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`live-notifications-tab:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => {
          fetchNotifs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifs]);

  const markRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllRead = async () => {
    if (!userId) return;
    await NotificationService.markAllAsRead(userId);
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    await NotificationService.togglePin(id, isPinned);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_pinned: isPinned } : n)
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
    );
  };

  const toggleArchive = async (id: string, isArchived: boolean) => {
    await NotificationService.toggleArchive(id, isArchived);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_archived: isArchived } : n)
    );
  };

  const remove = async (id: string) => {
    await NotificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    loading,
    markRead,
    markAllRead,
    togglePin,
    toggleArchive,
    remove,
    refetch: fetchNotifs
  };
};

export default useNotifications;
