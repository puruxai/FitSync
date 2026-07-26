// FitSync Friend Activity Service (Dual Mode: Supabase or Local Mock Fallback)
// Logs fitness achievement feeds and aggregates feed streams for a user's friends list

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import type { UserProfile } from '../types';

export interface FriendActivityItem {
  id: string;
  user_id: string;
  type: string;
  content: string;
  data: any;
  created_at: string;
  profile?: UserProfile;
}

export const ActivityService = {
  /**
   * Log an activity item to the feed
   */
  async logActivity(userId: string, type: string, content: string, data: any = {}): Promise<FriendActivityItem> {
    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('friend_activity')
        .insert({
          user_id: userId,
          type,
          content,
          data
        })
        .select()
        .single();

      if (error) throw error;
      return inserted as unknown as FriendActivityItem;
    } else {
      const feed = getFromMockDb<FriendActivityItem>('friend_activity');
      const newAct: FriendActivityItem = {
        id: 'act-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        type,
        content,
        data,
        created_at: new Date().toISOString()
      };
      feed.unshift(newAct);
      saveToMockDb('friend_activity', feed);
      return newAct;
    }
  },

  /**
   * Fetch social feed activities of user's friends
   */
  async getFriendActivityFeed(userId: string): Promise<FriendActivityItem[]> {
    if (isSupabaseConfigured) {
      // 1. Fetch user's friends first
      const { data: friendships } = await supabase
        .from('friends')
        .select('user1, user2')
        .or(`user1.eq.${userId},user2.eq.${userId}`);

      const friendIds = [userId]; // include own activity
      if (friendships) {
        friendships.forEach(f => {
          friendIds.push(f.user1 === userId ? f.user2 : f.user1);
        });
      }

      // 2. Fetch activities
      const { data, error } = await supabase
        .from('friend_activity')
        .select('*, profile:profiles!friend_activity_user_id_fkey(*)')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data as unknown as FriendActivityItem[]) || [];
    } else {
      const feed = getFromMockDb<FriendActivityItem>('friend_activity');
      const friendships = getFromMockDb<any>('friends');
      const profiles = getFromMockDb<UserProfile>('profiles');

      const friendIds = new Set<string>([userId]);
      friendships.forEach((f: any) => {
        if (f.user1 === userId) friendIds.add(f.user2);
        if (f.user2 === userId) friendIds.add(f.user1);
      });

      return feed
        .filter(item => friendIds.has(item.user_id))
        .map(item => ({
          ...item,
          profile: profiles.find(p => p.id === item.user_id)
        }))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
  }
};
