// FitSync Global Announcements Service
// Manages system alerts, maintenance banner schedules, and global releases announcements

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  content: string;
  type: 'global' | 'maintenance' | 'release_notes' | 'emergency';
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export const AnnouncementService = {
  /**
   * Publish new announcement banner
   */
  async publish(
    authorId: string,
    title: string,
    content: string,
    type: Announcement['type'],
    expiresInDays?: number
  ): Promise<Announcement> {
    const payload = {
      author_id: authorId,
      title,
      content,
      type,
      is_active: true,
      expires_at: expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('announcements')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Announcement;
    } else {
      const list = getFromMockDb<Announcement>('announcements');
      const newAnn = {
        id: 'ann-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      };
      list.push(newAnn);
      saveToMockDb('announcements', list);
      return newAnn;
    }
  },

  /**
   * Get active announcements list
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as Announcement[]) || [];
    } else {
      const list = getFromMockDb<Announcement>('announcements');
      return list.filter(a => a.is_active);
    }
  },

  /**
   * Deactivate announcement banner
   */
  async deactivate(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id);
    } else {
      const list = getFromMockDb<Announcement>('announcements');
      const idx = list.findIndex(a => a.id === id);
      if (idx !== -1) {
        list[idx].is_active = false;
        saveToMockDb('announcements', list);
      }
    }
  }
};
export default AnnouncementService;
