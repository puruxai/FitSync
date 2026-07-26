// FitSync Session Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles listing active devices and revoking session sessions tokens

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface UserSession {
  id: string;
  user_id: string;
  browser: string;
  os: string;
  ip_address?: string;
  location?: string;
  login_time: string;
  is_current: boolean;
}

export const SessionService = {
  /**
   * Get active sessions list
   */
  async getSessions(userId: string): Promise<UserSession[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('login_time', { ascending: false });

      if (error) throw error;
      return (data as unknown as UserSession[]) || [];
    } else {
      const list = getFromMockDb<UserSession>('user_sessions');
      const filtered = list.filter(s => s.user_id === userId);

      if (filtered.length === 0) {
        // Seed default current session
        const current: UserSession = {
          id: 'sess-current',
          user_id: userId,
          browser: 'Chrome Browser (V124)',
          os: 'Windows 11',
          ip_address: '192.168.1.45',
          location: 'San Francisco, CA',
          login_time: new Date().toISOString(),
          is_current: true
        };
        const older: UserSession = {
          id: 'sess-old-1',
          user_id: userId,
          browser: 'Safari Browser (Mobile)',
          os: 'iOS 17.4',
          ip_address: '72.190.12.89',
          location: 'Austin, TX',
          login_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          is_current: false
        };
        
        list.push(current, older);
        saveToMockDb('user_sessions', list);
        return [current, older];
      }
      return filtered;
    }
  },

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);
    } else {
      const list = getFromMockDb<UserSession>('user_sessions');
      const filtered = list.filter(s => s.id !== sessionId);
      saveToMockDb('user_sessions', filtered);
    }
  },

  /**
   * Logout all devices except current
   */
  async revokeAllExceptCurrent(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('is_current', false);
    } else {
      const list = getFromMockDb<UserSession>('user_sessions');
      const filtered = list.filter(s => s.user_id !== userId || s.is_current);
      saveToMockDb('user_sessions', filtered);
    }
  },

  /**
   * Track session connections (Compatibility check)
   */
  async logConnection(userId: string, event: 'connected' | 'disconnected' | 'reconnecting'): Promise<void> {
    console.log(`Session connection event: ${userId} -> ${event}`);
  }
};
export default SessionService;
