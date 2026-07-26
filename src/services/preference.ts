// FitSync Notification Preference Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles loading and modifying user settings for category alerts and emails toggling

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  mute_friend: boolean;
  mute_challenge: boolean;
  mute_workout: boolean;
  mute_reminder: boolean;
  mute_leaderboard: boolean;
  mute_achievement: boolean;
  mute_system: boolean;
  email_enabled: boolean;
}

export const PreferenceService = {
  /**
   * Get settings for a user
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as unknown as NotificationPreferences;

      // Seed default if empty
      return this.seedDefaultPreferences(userId);
    } else {
      const prefs = getFromMockDb<NotificationPreferences>('notification_preferences');
      const found = prefs.find(p => p.user_id === userId);
      if (found) return found;

      return this.seedDefaultPreferences(userId);
    }
  },

  /**
   * Update preferences
   */
  async updatePreferences(userId: string, updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id'>>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const prefs = getFromMockDb<NotificationPreferences>('notification_preferences');
      const idx = prefs.findIndex(p => p.user_id === userId);
      if (idx !== -1) {
        prefs[idx] = { ...prefs[idx], ...updates };
        saveToMockDb('notification_preferences', prefs);
      }
    }
  },

  /**
   * Seed defaults
   */
  async seedDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const defaults: Omit<NotificationPreferences, 'id'> = {
      user_id: userId,
      mute_friend: false,
      mute_challenge: false,
      mute_workout: false,
      mute_reminder: false,
      mute_leaderboard: false,
      mute_achievement: false,
      mute_system: false,
      email_enabled: true
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(defaults)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as NotificationPreferences;
    } else {
      const prefs = getFromMockDb<NotificationPreferences>('notification_preferences');
      const record: NotificationPreferences = {
        ...defaults,
        id: 'pref-' + Math.random().toString(36).substr(2, 9)
      };
      prefs.push(record);
      saveToMockDb('notification_preferences', prefs);
      return record;
    }
  }
};
