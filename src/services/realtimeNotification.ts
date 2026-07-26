// FitSync Realtime Notification Service (Dual Mode: Supabase or Local Mock Fallback)
// Wraps around the unified NotificationService to keep notifications and badges synchronized

import { NotificationService, type FitNotification } from './notification';

export interface FriendNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  content?: string;
}

export const RealtimeNotificationService = {
  /**
   * Post notification
   */
  async createNotification(userId: string, title: string, message: string, type: string): Promise<FriendNotification> {
    // Map categories based on notification type prefixes
    let category: FitNotification['category'] = 'system';
    if (type.startsWith('friend')) category = 'friend';
    else if (type.startsWith('challenge')) category = 'challenge';
    else if (type.startsWith('workout')) category = 'workout';
    else if (type.startsWith('reminder')) category = 'reminder';
    else if (type.startsWith('achievement') || type.startsWith('badge')) category = 'achievement';

    await NotificationService.createNotification(
      userId,
      title,
      message,
      type,
      'medium',
      undefined,
      undefined,
      category
    );

    return {
      id: 'fnot-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
      content: message
    };
  },

  /**
   * Get notifications history
   */
  async getNotifications(userId: string): Promise<FriendNotification[]> {
    const list = await NotificationService.getNotifications(userId);
    // Return only non-archived notifications to match inbox tab expectations
    return list
      .filter(n => !n.is_archived)
      .map(n => ({
        id: n.id,
        user_id: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: n.is_read,
        created_at: n.created_at,
        content: n.message
      }));
  },

  /**
   * Mark as read
   */
  async markAsRead(notifId: string): Promise<void> {
    await NotificationService.markAsRead(notifId);
  }
};
export default RealtimeNotificationService;
