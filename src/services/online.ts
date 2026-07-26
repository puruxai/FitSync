// FitSync Online Presence Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles updating and retrieving status indicators (online, offline, away, working_out)

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import type { OnlineStatus } from '../types';

export const OnlineStatusService = {
  /**
   * Set presence status
   */
  async updateStatus(profileId: string, status: 'online' | 'offline' | 'away' | 'working_out'): Promise<void> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('online_status')
        .upsert({
          profile_id: profileId,
          status,
          last_seen: timestamp
        });
      if (error) throw error;
    } else {
      const statuses = getFromMockDb<OnlineStatus>('online_status');
      const idx = statuses.findIndex(s => s.profile_id === profileId);

      if (idx !== -1) {
        statuses[idx] = { profile_id: profileId, status, last_seen: timestamp, is_online: status !== 'offline' };
      } else {
        statuses.push({ profile_id: profileId, status, last_seen: timestamp, is_online: status !== 'offline' });
      }
      saveToMockDb('online_status', statuses);
    }
  },

  /**
   * Get online presence of list of user IDs
   */
  async getStatuses(profileIds: string[]): Promise<OnlineStatus[]> {
    if (profileIds.length === 0) return [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('online_status')
        .select('*')
        .in('profile_id', profileIds);

      if (error) throw error;
      return ((data as unknown as OnlineStatus[]) || []).map(row => ({
        ...row,
        is_online: row.status !== 'offline'
      }));
    } else {
      const statuses = getFromMockDb<OnlineStatus>('online_status');
      return statuses.filter(s => profileIds.includes(s.profile_id)).map(s => ({
        ...s,
        is_online: s.status !== 'offline'
      }));
    }
  },

  /**
   * Retrieve online presence for a single profile ID
   */
  async getStatus(profileId: string): Promise<OnlineStatus> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('online_status')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const row = data as unknown as OnlineStatus;
        return {
          ...row,
          is_online: row.status !== 'offline'
        };
      }
      return { profile_id: profileId, status: 'offline', is_online: false, last_seen: new Date().toISOString() };
    } else {
      const statuses = getFromMockDb<OnlineStatus>('online_status');
      const found = statuses.find(s => s.profile_id === profileId);
      if (found) {
        return {
          ...found,
          is_online: found.status !== 'offline'
        };
      }
      return { profile_id: profileId, status: 'offline', is_online: false, last_seen: new Date().toISOString() };
    }
  }
};
