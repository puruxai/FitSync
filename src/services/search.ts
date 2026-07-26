// FitSync Search Service (Dual Mode: Supabase or Local Mock Fallback)
// Searches users by name, username, or fitsync ID while filtering out blocked contacts

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import type { UserProfile } from '../types';

export interface RecentSearch {
  id: string;
  user_id: string;
  query: string;
  created_at: string;
}

export const SearchService = {
  /**
   * Search profiles by text matching username, fitsync_id, or full_name
   */
  async searchUsers(currentUserId: string, searchStr: string): Promise<UserProfile[]> {
    const term = searchStr.trim().toLowerCase();
    if (!term) return [];

    if (isSupabaseConfigured) {
      // Fetch all blocked user IDs involving current user
      const { data: blocks } = await supabase
        .from('blocked_users')
        .select('user_id, blocked_id')
        .or(`user_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

      const blockedIds = new Set<string>();
      if (blocks) {
        blocks.forEach(b => {
          blockedIds.add(b.user_id);
          blockedIds.add(b.blocked_id);
        });
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${term}%,full_name.ilike.%${term}%,fitsync_id.ilike.%${term}%`)
        .neq('id', currentUserId)
        .limit(20);

      if (error) throw error;

      // Filter out blocked users
      return ((data as unknown as UserProfile[]) || []).filter(p => !blockedIds.has(p.id));
    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      
      const blocks = getFromMockDb<any>('blocked_users');
      const blockedIds = new Set<string>();
      blocks.forEach((b: any) => {
        if (b.user_id === currentUserId) blockedIds.add(b.blocked_id);
        if (b.blocked_id === currentUserId) blockedIds.add(b.user_id);
      });

      return profiles
        .filter(p => p.id !== currentUserId)
        .filter(p => !blockedIds.has(p.id))
        .filter(p => 
          p.username.toLowerCase().includes(term) ||
          p.full_name.toLowerCase().includes(term) ||
          p.fitsync_id.toLowerCase().includes(term)
        );
    }
  },

  /**
   * Fetch search suggestions (people you may know or general active users)
   */
  async getSearchSuggestions(currentUserId: string): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      // Simple suggestion: Fetch top profiles that are not friends and not blocked
      const { data: friends } = await supabase
        .from('friends')
        .select('user1, user2')
        .or(`user1.eq.${currentUserId},user2.eq.${currentUserId}`);

      const exclusions = new Set<string>([currentUserId]);
      if (friends) {
        friends.forEach(f => {
          exclusions.add(f.user1);
          exclusions.add(f.user2);
        });
      }

      // Add blocked
      const { data: blocks } = await supabase
        .from('blocked_users')
        .select('user_id, blocked_id')
        .or(`user_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);
      if (blocks) {
        blocks.forEach(b => {
          exclusions.add(b.user_id);
          exclusions.add(b.blocked_id);
        });
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (error) throw error;
      return ((data as unknown as UserProfile[]) || []).filter(p => !exclusions.has(p.id));
    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      const friendships = getFromMockDb<any>('friends');
      const blocks = getFromMockDb<any>('blocked_users');

      const exclusions = new Set<string>([currentUserId]);
      friendships.forEach((f: any) => {
        if (f.user1 === currentUserId) exclusions.add(f.user2);
        if (f.user2 === currentUserId) exclusions.add(f.user1);
      });
      blocks.forEach((b: any) => {
        if (b.user_id === currentUserId) exclusions.add(b.blocked_id);
        if (b.blocked_id === currentUserId) exclusions.add(b.user_id);
      });

      return profiles.filter(p => !exclusions.has(p.id)).slice(0, 5);
    }
  },

  /**
   * Save a search query to search history
   */
  async saveRecentSearch(userId: string, queryStr: string): Promise<void> {
    const clean = queryStr.trim();
    if (!clean) return;

    if (isSupabaseConfigured) {
      await supabase
        .from('recent_searches')
        .insert({ user_id: userId, query: clean });
    } else {
      const searches = getFromMockDb<RecentSearch>('recent_searches');
      // Keep unique searches
      const filtered = searches.filter(s => !(s.user_id === userId && s.query.toLowerCase() === clean.toLowerCase()));
      filtered.unshift({
        id: 'search-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        query: clean,
        created_at: new Date().toISOString()
      });
      saveToMockDb('recent_searches', filtered.slice(0, 10)); // limit 10
    }
  },

  /**
   * Get recent search history
   */
  async getRecentSearches(userId: string): Promise<string[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) return [];
      return Array.from(new Set(data.map(d => d.query)));
    } else {
      const searches = getFromMockDb<RecentSearch>('recent_searches');
      const list = searches.filter(s => s.user_id === userId).map(s => s.query);
      return Array.from(new Set(list)).slice(0, 5);
    }
  },

  /**
   * Clear search history
   */
  async clearRecentSearches(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('recent_searches')
        .delete()
        .eq('user_id', userId);
    } else {
      const searches = getFromMockDb<RecentSearch>('recent_searches');
      const filtered = searches.filter(s => s.user_id !== userId);
      saveToMockDb('recent_searches', filtered);
    }
  }
};
