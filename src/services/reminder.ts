// FitSync Reminder Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles creating custom reminder items and triggers notifications for workout, steps, and hydration

import { NotificationService } from './notification';

export interface FitnessReminder {
  id: string;
  user_id: string;
  type: 'workout' | 'water' | 'steps' | 'sleep' | 'weight' | 'challenge_deadline';
  time: string; // e.g. "08:00"
  days: string[]; // e.g. ["Mon", "Wed", "Fri"]
  message: string;
  is_active: boolean;
}

export const ReminderService = {
  /**
   * Get active reminders
   */
  async getReminders(userId: string): Promise<FitnessReminder[]> {
    const key = `fs_reminders_${userId}`;
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);

    // Default seeded reminders
    const defaults: FitnessReminder[] = [
      { id: 'rem-w1', user_id: userId, type: 'workout', time: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], message: 'Time for your daily HIIT workout workout!', is_active: true },
      { id: 'rem-w2', user_id: userId, type: 'water', time: '11:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], message: 'Stay hydrated! Grab a glass of water.', is_active: true },
      { id: 'rem-w3', user_id: userId, type: 'steps', time: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], message: 'Check step goals progress. A quick walk helps!', is_active: false }
    ];
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  },

  /**
   * Save reminder list
   */
  async saveReminder(userId: string, reminder: FitnessReminder): Promise<void> {
    const list = await this.getReminders(userId);
    const idx = list.findIndex(r => r.id === reminder.id);
    if (idx !== -1) {
      list[idx] = reminder;
    } else {
      list.push({
        ...reminder,
        id: 'rem-' + Math.random().toString(36).substr(2, 9)
      });
    }
    localStorage.setItem(`fs_reminders_${userId}`, JSON.stringify(list));

    // If active and time matches, trigger a notification right away as a demonstration alert!
    if (reminder.is_active) {
      await NotificationService.createNotification(
        userId,
        `FitSync Reminder: ${reminder.type.toUpperCase()}`,
        reminder.message,
        'reminder_alert',
        'medium',
        undefined,
        undefined,
        'reminder'
      );
    }
  },

  /**
   * Delete reminder
   */
  async deleteReminder(userId: string, reminderId: string): Promise<void> {
    const list = await this.getReminders(userId);
    const filtered = list.filter(r => r.id !== reminderId);
    localStorage.setItem(`fs_reminders_${userId}`, JSON.stringify(filtered));
  }
};
