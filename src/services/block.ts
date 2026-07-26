// FitSync Block Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles blocking/unblocking users and checking active blocks

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import type { UserProfile } from '../types';

export interface BlockedUser {
  id: string;
  user_id: string;
  blocked_id: string;
  created_at: string;
  blocked_profile?: UserProfile;
}

export const BlockService = {
  /**
   * Block a user
   */
  async blockUser(userId: string, blockedId: string): Promise<void> {
    if (userId === blockedId) throw new Error('You cannot block yourself.');

    if (isSupabaseConfigured) {
      // Delete any existing friendships or requests first
      await supabase
        .from('friends')
        .delete()
        .or(`and(user1.eq.${userId},user2.eq.${blockedId}),and(user1.eq.${blockedId},user2.eq.${userId})`);

      await supabase
        .from('friend_requests')
        .delete()
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${blockedId}),and(sender_id.eq.${blockedId},receiver_id.eq.${userId})`);

      const { error } = await supabase
        .from('blocked_users')
        .insert({ user_id: userId, blocked_id: blockedId });

      if (error && error.code !== '23505') throw error; // ignore unique violation
    } else {
      const blocks = getFromMockDb<BlockedUser>('blocked_users');
      if (blocks.some(b => b.user_id === userId && b.blocked_id === blockedId)) return;

      blocks.push({
        id: 'block-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        blocked_id: blockedId,
        created_at: new Date().toISOString()
      });
      saveToMockDb('blocked_users', blocks);

      // Clean friends list locally
      const friendships = getFromMockDb<any>('friends');
      const filteredFriends = friendships.filter(
        (f: any) => !((f.user1 === userId && f.user2 === blockedId) || (f.user1 === blockedId && f.user2 === userId))
      );
      saveToMockDb('friends', filteredFriends);

      // Clean requests locally
      const requests = getFromMockDb<any>('friend_requests');
      const filteredReqs = requests.filter(
        (r: any) => !((r.sender_id === userId && r.receiver_id === blockedId) || (r.sender_id === blockedId && r.receiver_id === userId))
      );
      saveToMockDb('friend_requests', filteredReqs);
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, blockedId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_id', blockedId);
      if (error) throw error;
    } else {
      const blocks = getFromMockDb<BlockedUser>('blocked_users');
      const filtered = blocks.filter(b => !(b.user_id === userId && b.blocked_id === blockedId));
      saveToMockDb('blocked_users', filtered);
    }
  },

  /**
   * Get list of blocked profiles
   */
  async getBlockedList(userId: string): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*, blocked_profile:profiles!blocked_users_blocked_id_fkey(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return ((data as any[]) || []).map(b => b.blocked_profile) as UserProfile[];
    } else {
      const blocks = getFromMockDb<BlockedUser>('blocked_users');
      const profiles = getFromMockDb<UserProfile>('profiles');
      return blocks
        .filter(b => b.user_id === userId)
        .map(b => profiles.find(p => p.id === b.blocked_id))
        .filter(Boolean) as UserProfile[];
    }
  },

  /**
   * Check if block exists between A and B
   */
  async isBlocked(userA: string, userB: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .or(`and(user_id.eq.${userA},blocked_id.eq.${userB}),and(user_id.eq.${userB},blocked_id.eq.${userA})`)
        .maybeSingle();
      if (error) return false;
      return !!data;
    } else {
      const blocks = getFromMockDb<BlockedUser>('blocked_users');
      return blocks.some(
        b => (b.user_id === userA && b.blocked_id === userB) || 
             (b.user_id === userB && b.blocked_id === userA)
      );
    }
  }
};
