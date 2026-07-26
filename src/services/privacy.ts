// FitSync Privacy Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles reading and writing granular profile visibility settings and biometrics locks

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface PrivacySettings {
  profile_id: string;
  profile_visibility: 'public' | 'friends' | 'private';
  share_fitness: boolean;
  hide_weight: boolean;
  hide_height: boolean;
  hide_age: boolean;
  hide_bmi: boolean;
  hide_workout_history: boolean;
  hide_friend_list: boolean;
  hide_challenges: boolean;
  hide_leaderboard_ranking: boolean;
  hide_online_status: boolean;
  hide_last_seen: boolean;
  hide_activity_feed: boolean;
  updated_at: string;
}

export const PrivacyService = {
  /**
   * Get privacy settings
   */
  async getPrivacy(profileId: string): Promise<PrivacySettings> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as unknown as PrivacySettings;

      return this.seedDefaultPrivacy(profileId);
    } else {
      const settings = getFromMockDb<PrivacySettings>('privacy_settings');
      const record = settings.find(s => s.profile_id === profileId);
      if (record) return record;

      return this.seedDefaultPrivacy(profileId);
    }
  },

  /**
   * Update privacy settings
   */
  async updatePrivacy(profileId: string, updates: Partial<Omit<PrivacySettings, 'profile_id' | 'updated_at'>>): Promise<PrivacySettings> {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('privacy_settings')
        .update(payload)
        .eq('profile_id', profileId)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PrivacySettings;
    } else {
      const settings = getFromMockDb<PrivacySettings>('privacy_settings');
      const idx = settings.findIndex(s => s.profile_id === profileId);
      if (idx !== -1) {
        settings[idx] = { ...settings[idx], ...payload };
        saveToMockDb('privacy_settings', settings);
        return settings[idx];
      }
      throw new Error('Privacy record not found');
    }
  },

  /**
   * Seed defaults
   */
  async seedDefaultPrivacy(profileId: string): Promise<PrivacySettings> {
    const defaults: PrivacySettings = {
      profile_id: profileId,
      profile_visibility: 'public',
      share_fitness: true,
      hide_weight: false,
      hide_height: false,
      hide_age: false,
      hide_bmi: false,
      hide_workout_history: false,
      hide_friend_list: false,
      hide_challenges: false,
      hide_leaderboard_ranking: false,
      hide_online_status: false,
      hide_last_seen: false,
      hide_activity_feed: false,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('privacy_settings')
        .insert(defaults)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PrivacySettings;
    } else {
      const settings = getFromMockDb<PrivacySettings>('privacy_settings');
      settings.push(defaults);
      saveToMockDb('privacy_settings', settings);
      return defaults;
    }
  }
};
export default PrivacyService;
