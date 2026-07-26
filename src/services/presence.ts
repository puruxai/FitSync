// FitSync Presence Service (Dual Mode: Supabase or Local Mock Fallback)
// Automatically tracks user presence states (online, offline, away, working_out, sleeping, busy) and visibility logs

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export const PresenceService = {
  /**
   * Set user status presence
   */
  async setPresence(
    userId: string, 
    status: 'online' | 'offline' | 'away' | 'busy' | 'working_out' | 'sleeping' | 'invisible'
  ): Promise<void> {
    if (status === 'invisible') {
      // Invisible maps to offline status for other users
      await this.updateStatusRow(userId, 'offline');
    } else {
      await this.updateStatusRow(userId, status as any);
    }

    // Log to presence_logs
    if (isSupabaseConfigured) {
      await supabase
        .from('presence_logs')
        .insert({
          user_id: userId,
          status,
          client_info: navigator.userAgent
        });
    } else {
      const logs = getFromMockDb<any>('presence_logs');
      logs.push({
        id: 'pres-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        status,
        client_info: navigator.userAgent,
        created_at: new Date().toISOString()
      });
      saveToMockDb('presence_logs', logs);
    }
  },

  /**
   * Helper status updates
   */
  async updateStatusRow(userId: string, status: 'online' | 'offline' | 'away' | 'working_out'): Promise<void> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured) {
      await supabase
        .from('online_status')
        .upsert({
          profile_id: userId,
          status,
          last_seen: timestamp
        });
    } else {
      const statuses = getFromMockDb<any>('online_status');
      const idx = statuses.findIndex((s: any) => s.profile_id === userId);
      if (idx !== -1) {
        statuses[idx] = { profile_id: userId, status, last_seen: timestamp };
      } else {
        statuses.push({ profile_id: userId, status, last_seen: timestamp });
      }
      saveToMockDb('online_status', statuses);
    }
  }
};
