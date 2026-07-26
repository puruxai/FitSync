// FitSync Security Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles updating user credentials, toggling security preferences, and managing trusted devices

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface SecuritySettings {
  profile_id: string;
  two_factor_enabled: boolean;
  login_alerts_enabled: boolean;
  updated_at: string;
}

export interface TrustedDevice {
  id: string;
  user_id: string;
  device_name: string;
  trusted_at: string;
}

export const SecurityService = {
  /**
   * Change password
   */
  async changePassword(password: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } else {
      console.log('Mock Change Password: Password updated locally');
    }
  },

  /**
   * Get settings
   */
  async getSettings(profileId: string): Promise<SecuritySettings> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as unknown as SecuritySettings;

      return this.seedDefaultSecurity(profileId);
    } else {
      const settings = getFromMockDb<SecuritySettings>('security_settings');
      const found = settings.find(s => s.profile_id === profileId);
      if (found) return found;

      return this.seedDefaultSecurity(profileId);
    }
  },

  /**
   * Update settings
   */
  async updateSettings(profileId: string, updates: Partial<Omit<SecuritySettings, 'profile_id' | 'updated_at'>>): Promise<void> {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('security_settings')
        .update(payload)
        .eq('profile_id', profileId);
      if (error) throw error;
    } else {
      const settings = getFromMockDb<SecuritySettings>('security_settings');
      const idx = settings.findIndex(s => s.profile_id === profileId);
      if (idx !== -1) {
        settings[idx] = { ...settings[idx], ...payload };
        saveToMockDb('security_settings', settings);
      }
    }
  },

  /**
   * Get trusted devices list
   */
  async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data as unknown as TrustedDevice[]) || [];
    } else {
      const devices = getFromMockDb<TrustedDevice>('trusted_devices');
      const filtered = devices.filter(d => d.user_id === userId);
      if (filtered.length === 0) {
        // Seed default device
        const defaultDev: TrustedDevice = {
          id: 'dev-1',
          user_id: userId,
          device_name: 'Chrome / Windows 10 (Current Session)',
          trusted_at: new Date().toISOString()
        };
        devices.push(defaultDev);
        saveToMockDb('trusted_devices', devices);
        return [defaultDev];
      }
      return filtered;
    }
  },

  /**
   * Add trusted device
   */
  async addTrustedDevice(userId: string, deviceName: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('trusted_devices')
        .insert({ user_id: userId, device_name: deviceName });
    } else {
      const devices = getFromMockDb<TrustedDevice>('trusted_devices');
      devices.push({
        id: 'dev-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        device_name: deviceName,
        trusted_at: new Date().toISOString()
      });
      saveToMockDb('trusted_devices', devices);
    }
  },

  /**
   * Remove trusted device
   */
  async removeTrustedDevice(deviceId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('trusted_devices')
        .delete()
        .eq('id', deviceId);
    } else {
      const devices = getFromMockDb<TrustedDevice>('trusted_devices');
      const filtered = devices.filter(d => d.id !== deviceId);
      saveToMockDb('trusted_devices', filtered);
    }
  },

  /**
   * Seed defaults
   */
  async seedDefaultSecurity(profileId: string): Promise<SecuritySettings> {
    const defaults: SecuritySettings = {
      profile_id: profileId,
      two_factor_enabled: false,
      login_alerts_enabled: true,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('security_settings')
        .insert(defaults)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as SecuritySettings;
    } else {
      const settings = getFromMockDb<SecuritySettings>('security_settings');
      settings.push(defaults);
      saveToMockDb('security_settings', settings);
      return defaults;
    }
  }
};
export default SecurityService;
