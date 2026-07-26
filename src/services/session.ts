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

function detectBrowserAndOS() {
  if (typeof navigator === 'undefined') {
    return { browser: 'Unavailable', os: 'Unavailable', userAgent: 'Unavailable' };
  }
  const ua = navigator.userAgent;
  let browser = 'Unavailable';
  let os = 'Unavailable';

  // OS detection
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser detection
  if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/edge|edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  return { browser, os, userAgent: ua };
}

export const SessionService = {
  /**
   * Get active sessions list
   */
  async getSessions(userId: string): Promise<UserSession[]> {
    let currentSessId = sessionStorage.getItem('fs_session_id');
    if (!currentSessId) {
      // Generate a client session ID
      currentSessId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sess-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('fs_session_id', currentSessId);
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('login_time', { ascending: false });

      if (error) throw error;
      const dbSessions = (data as unknown as UserSession[]) || [];

      const currentSessionExists = dbSessions.some(s => s.id === currentSessId);
      if (!currentSessionExists) {
        const { browser, os } = detectBrowserAndOS();
        const newSessionRow = {
          id: currentSessId,
          user_id: userId,
          browser,
          os,
          ip_address: '127.0.0.1',
          location: 'Local Session',
          login_time: new Date().toISOString(),
          is_current: true,
          token_id: currentSessId
        };
        const { data: inserted, error: insertError } = await supabase
          .from('user_sessions')
          .insert(newSessionRow)
          .select()
          .single();

        if (!insertError && inserted) {
          dbSessions.unshift(inserted as unknown as UserSession);
        }
      }

      return dbSessions.map(s => ({
        ...s,
        is_current: s.id === currentSessId
      }));
    } else {
      const list = getFromMockDb<UserSession>('user_sessions');
      const filtered = list.filter(s => s.user_id === userId);

      const currentSessionExists = filtered.some(s => s.id === currentSessId);
      if (!currentSessionExists) {
        const { browser, os } = detectBrowserAndOS();
        const current: UserSession = {
          id: currentSessId,
          user_id: userId,
          browser: `${browser} Browser`,
          os,
          ip_address: '127.0.0.1',
          location: 'Local Session',
          login_time: new Date().toISOString(),
          is_current: true
        };
        list.push(current);
        saveToMockDb('user_sessions', list);
        filtered.push(current);
      }

      return filtered.map(s => ({
        ...s,
        is_current: s.id === currentSessId
      }));
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
