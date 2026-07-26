// FitSync Notification Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles custom categories, priorities, pinning, archiving, and notifications muting checks

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { PreferenceService } from './preference';

export interface FitNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  sender_id?: string;
  target_resource?: string;
  is_read: boolean;
  is_archived: boolean;
  is_pinned: boolean;
  category: 'friend' | 'challenge' | 'workout' | 'reminder' | 'leaderboard' | 'achievement' | 'system';
  created_at: string;
  
  // Joins
  sender_profile?: any;
  // Legacy compatibility fields
  profile_id?: string;
  content?: string;
}

export const NotificationService = {
  /**
   * Get user notifications
   */
  async getNotifications(userId: string): Promise<FitNotification[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, sender_profile:profiles!notifications_sender_id_fkey(*)')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return ((data as unknown as FitNotification[]) || []).map(n => ({
        ...n,
        profile_id: n.user_id,
        content: n.message
      }));
    } else {
      const notifications = getFromMockDb<FitNotification>('notifications');
      const profiles = getFromMockDb<any>('profiles');

      return notifications
        .filter(n => n.user_id === userId)
        .map(n => ({
          ...n,
          profile_id: userId,
          content: n.message,
          sender_profile: profiles.find((p: any) => p.id === n.sender_id)
        }))
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }
  },

  /**
   * Mark as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    } else {
      const notifications = getFromMockDb<FitNotification>('notifications');
      const idx = notifications.findIndex(n => n.id === notificationId);
      if (idx !== -1) {
        notifications[idx].is_read = true;
        saveToMockDb('notifications', notifications);
      }
    }
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const notifications = getFromMockDb<FitNotification>('notifications');
      const updated = notifications.map(n => n.user_id === userId ? { ...n, is_read: true } : n);
      saveToMockDb('notifications', updated);
    }
  },

  /**
   * Toggle Pin Status
   */
  async togglePin(notificationId: string, isPinned: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_pinned: isPinned })
        .eq('id', notificationId);
      if (error) throw error;
    } else {
      const notifications = getFromMockDb<FitNotification>('notifications');
      const idx = notifications.findIndex(n => n.id === notificationId);
      if (idx !== -1) {
        notifications[idx].is_pinned = isPinned;
        saveToMockDb('notifications', notifications);
      }
    }
  },

  /**
   * Toggle Archive Status
   */
  async toggleArchive(notificationId: string, isArchived: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: isArchived })
        .eq('id', notificationId);
      if (error) throw error;
    } else {
      const notifications = getFromMockDb<FitNotification>('notifications');
      const idx = notifications.findIndex(n => n.id === notificationId);
      if (idx !== -1) {
        notifications[idx].is_archived = isArchived;
        saveToMockDb('notifications', notifications);
      }
    }
  },

  /**
   * Delete Notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    } else {
      const notifications = getFromMockDb<FitNotification>('notifications');
      const filtered = notifications.filter(n => n.id !== notificationId);
      saveToMockDb('notifications', filtered);
    }
  },

  /**
   * Create Notification (Checks mute status before sending)
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    priority: FitNotification['priority'] = 'medium',
    senderId?: string,
    targetResource?: string,
    category: FitNotification['category'] = 'system'
  ): Promise<void> {
    // 1. Check if category is muted
    const prefs = await PreferenceService.getPreferences(userId);
    const isMuted = 
      (category === 'friend' && prefs.mute_friend) ||
      (category === 'challenge' && prefs.mute_challenge) ||
      (category === 'workout' && prefs.mute_workout) ||
      (category === 'reminder' && prefs.mute_reminder) ||
      (category === 'leaderboard' && prefs.mute_leaderboard) ||
      (category === 'achievement' && prefs.mute_achievement) ||
      (category === 'system' && prefs.mute_system);

    if (isMuted) {
      console.log(`Notification of category ${category} is muted for user ${userId}. Dropping.`);
      return;
    }

    // 2. Insert record
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          priority,
          sender_id: senderId,
          target_resource: targetResource,
          category,
          is_read: false,
          is_archived: false,
          is_pinned: false
        });
      if (error) throw error;
    } else {
      const notifications = getFromMockDb<FitNotification>('notifications');
      notifications.unshift({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        profile_id: userId,
        title,
        message,
        type,
        priority,
        sender_id: senderId,
        target_resource: targetResource,
        is_read: false,
        is_archived: false,
        is_pinned: false,
        category,
        content: message,
        created_at: new Date().toISOString()
      });
      saveToMockDb('notifications', notifications);
    }
  }
};
export default NotificationService;
