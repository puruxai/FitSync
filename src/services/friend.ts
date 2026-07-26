// FitSync Friend Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles established friendships, sending/processing friend requests, and mutual friend listings

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { BlockService } from './block';
import type { Friend, FriendRequest, UserProfile } from '../types';

export const FriendService = {
  // 1. Fetch user's friends list
  async getFriends(userId: string): Promise<Friend[]> {
    if (isSupabaseConfigured) {
      // In Supabase, the record has user1 and user2. We query both sides.
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id, user1, user2, favorite, created_at,
          user1_profile:profiles!friends_user1_fkey(*),
          user2_profile:profiles!friends_user2_fkey(*)
        `)
        .or(`user1.eq.${userId},user2.eq.${userId}`);

      if (error) throw error;

      // Map to UI expectation where each friendship has a 'friend_profile'
      return ((data as any[]) || []).map(f => {
        const isUser1 = f.user1 === userId;
        const friendProfile = isUser1 ? f.user2_profile : f.user1_profile;
        const friendId = isUser1 ? f.user2 : f.user1;
        return {
          id: f.id,
          user1: f.user1,
          user2: f.user2,
          user_id: userId,
          friend_id: friendId,
          favorite: f.favorite || false,
          created_at: f.created_at,
          friend_profile: friendProfile as unknown as UserProfile
        };
      });
    } else {
      const friendships = getFromMockDb<Friend>('friends');
      const profiles = getFromMockDb<UserProfile>('profiles');

      return friendships
        .filter(f => f.user1 === userId || f.user2 === userId)
        .map(f => {
          const isUser1 = f.user1 === userId;
          const friendId = isUser1 ? f.user2 : f.user1;
          const friendProfile = profiles.find(p => p.id === friendId);
          return {
            ...f,
            user_id: userId,
            friend_id: friendId,
            favorite: f.favorite || false,
            friend_profile: friendProfile
          };
        });
    }
  },

  // 2. Fetch pending friend requests
  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*, sender:profiles!friend_requests_sender_id_fkey(*)')
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return (data as unknown as FriendRequest[]) || [];
    } else {
      const requests = getFromMockDb<FriendRequest>('friend_requests');
      const profiles = getFromMockDb<UserProfile>('profiles');

      return requests
        .filter(r => r.receiver_id === userId && r.status === 'pending')
        .map(r => ({
          ...r,
          sender: profiles.find(p => p.id === r.sender_id)
        }));
    }
  },

  // 3. Send a friend request by receiver's username or FitSync ID
  async sendFriendRequest(senderId: string, queryStr: string): Promise<void> {
    const cleanQuery = queryStr.trim();
    if (!cleanQuery) throw new Error('Search query cannot be empty.');

    if (isSupabaseConfigured) {
      // Find receiver profile by username or FitSync ID
      const { data: receiver, error: findErr } = await supabase
        .from('profiles')
        .select('id')
        .or(`username.eq.${cleanQuery},fitsync_id.eq.${cleanQuery}`)
        .maybeSingle();

      if (findErr) throw findErr;
      if (!receiver) throw new Error(`User "${cleanQuery}" not found.`);
      if (receiver.id === senderId) throw new Error('You cannot send a friend request to yourself.');

      // Check if blocked
      const blocked = await BlockService.isBlocked(senderId, receiver.id);
      if (blocked) throw new Error('This user cannot be added at this time.');

      // Check if already friends or if request exists
      const { data: existing, error: checkErr } = await supabase
        .from('friend_requests')
        .select('id, status')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${senderId})`)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        if (existing.status === 'accepted') throw new Error('You are already friends with this user.');
        throw new Error('A friend request already exists between you.');
      }

      // Send request
      const { error: insertErr } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiver.id,
          status: 'pending'
        });

      if (insertErr) throw insertErr;

      // Notify receiver
      const { data: sender } = await supabase.from('profiles').select('full_name').eq('id', senderId).single();
      await supabase.from('friend_notifications').insert({
        user_id: receiver.id,
        title: 'New Friend Request',
        message: `${sender?.full_name || 'An athlete'} sent you a friend request.`,
        type: 'friend_request_received'
      });
    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      const receiver = profiles.find(
        p => p.username.toLowerCase() === cleanQuery.toLowerCase() || 
             p.fitsync_id.toLowerCase() === cleanQuery.toLowerCase()
      );

      if (!receiver) throw new Error(`User "${cleanQuery}" not found.`);
      if (receiver.id === senderId) throw new Error('You cannot send a friend request to yourself.');

      const blocked = await BlockService.isBlocked(senderId, receiver.id);
      if (blocked) throw new Error('This user cannot be added at this time.');

      const requests = getFromMockDb<FriendRequest>('friend_requests');
      const exists = requests.some(
        r => (r.sender_id === senderId && r.receiver_id === receiver.id) ||
             (r.sender_id === receiver.id && r.receiver_id === senderId)
      );

      if (exists) throw new Error('A friend request already exists between you.');

      requests.push({
        id: 'req-' + Math.random().toString(36).substr(2, 9),
        sender_id: senderId,
        receiver_id: receiver.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      saveToMockDb('friend_requests', requests);

      // Create notification
      const sender = profiles.find(p => p.id === senderId);
      const notifications = getFromMockDb<any>('friend_notifications');
      notifications.unshift({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        user_id: receiver.id,
        title: 'New Friend Request',
        message: `${sender?.full_name || 'An athlete'} sent you a friend request.`,
        type: 'friend_request_received',
        is_read: false,
        created_at: new Date().toISOString()
      });
      saveToMockDb('friend_notifications', notifications);
    }
  },

  // 4. Accept or Reject friend request
  async handleFriendRequest(requestId: string, status: 'accepted' | 'rejected', currentUserId: string): Promise<void> {
    if (isSupabaseConfigured) {
      if (status === 'accepted') {
        const { data: request, error: fetchErr } = await supabase
          .from('friend_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (fetchErr) throw fetchErr;

        // Insert friendship (user1, user2) sorted alphabetically/by uuid to ensure consistency
        const [u1, u2] = [request.sender_id, request.receiver_id].sort();
        const { error: friendErr } = await supabase
          .from('friends')
          .insert({ user1: u1, user2: u2 });

        if (friendErr) throw friendErr;

        // Log social feed activity
        const { data: sender } = await supabase.from('profiles').select('full_name').eq('id', request.sender_id).single();
        const { data: receiver } = await supabase.from('profiles').select('full_name').eq('id', request.receiver_id).single();
        
        await supabase.from('friend_activity').insert([
          { user_id: request.sender_id, type: 'friend_connected', content: `is now friends with ${receiver?.full_name || 'Athlete'}` },
          { user_id: request.receiver_id, type: 'friend_connected', content: `is now friends with ${sender?.full_name || 'Athlete'}` }
        ]);

        // Send confirmation notification
        const notifiedId = request.sender_id === currentUserId ? request.receiver_id : request.sender_id;
        const notifiedName = request.sender_id === currentUserId ? sender?.full_name : receiver?.full_name;
        await supabase.from('friend_notifications').insert({
          user_id: notifiedId,
          title: 'Friend Request Accepted',
          message: `${notifiedName || 'An athlete'} accepted your friend request!`,
          type: 'friend_request_accepted'
        });
      }

      // Update request status
      const { error: updateErr } = await supabase
        .from('friend_requests')
        .update({ status })
        .eq('id', requestId);

      if (updateErr) throw updateErr;
    } else {
      const requests = getFromMockDb<FriendRequest>('friend_requests');
      const reqIdx = requests.findIndex(r => r.id === requestId);
      if (reqIdx === -1) return;

      const request = requests[reqIdx];

      if (status === 'accepted') {
        // Add friendship
        const friendships = getFromMockDb<Friend>('friends');
        const [u1, u2] = [request.sender_id, request.receiver_id].sort();
        friendships.push({
          id: `f-${u1}-${u2}`,
          user1: u1,
          user2: u2,
          favorite: false,
          created_at: new Date().toISOString()
        });
        saveToMockDb('friends', friendships);

        // Add activity
        const profiles = getFromMockDb<UserProfile>('profiles');
        const p2 = profiles.find(p => p.id === request.receiver_id);
        const p1 = profiles.find(p => p.id === request.sender_id);
        
        const feed = getFromMockDb<any>('friend_activity');
        feed.unshift(
          {
            id: 'act-' + Math.random().toString(36).substr(2, 9),
            user_id: request.sender_id,
            type: 'friend_connected',
            content: `is now friends with ${p2?.full_name || 'Athlete'}`,
            created_at: new Date().toISOString()
          },
          {
            id: 'act-' + Math.random().toString(36).substr(2, 9),
            user_id: request.receiver_id,
            type: 'friend_connected',
            content: `is now friends with ${p1?.full_name || 'Athlete'}`,
            created_at: new Date().toISOString()
          }
        );
        saveToMockDb('friend_activity', feed);

        // Notify
        const notifiedId = request.sender_id === currentUserId ? request.receiver_id : request.sender_id;
        const notifiedName = request.sender_id === currentUserId ? p1?.full_name : p2?.full_name;
        const notifications = getFromMockDb<any>('friend_notifications');
        notifications.unshift({
          id: 'not-' + Math.random().toString(36).substr(2, 9),
          user_id: notifiedId,
          title: 'Friend Request Accepted',
          message: `${notifiedName || 'An athlete'} accepted your friend request!`,
          type: 'friend_request_accepted',
          is_read: false,
          created_at: new Date().toISOString()
        });
        saveToMockDb('friend_notifications', notifications);
      }

      // Remove the request
      requests.splice(reqIdx, 1);
      saveToMockDb('friend_requests', requests);
    }
  },

  // 5. Remove a friend
  async removeFriend(userId: string, friendId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user1.eq.${userId},user2.eq.${friendId}),and(user1.eq.${friendId},user2.eq.${userId})`);

      if (error) throw error;
    } else {
      const friendships = getFromMockDb<Friend>('friends');
      const filtered = friendships.filter(
        f => !((f.user1 === userId && f.user2 === friendId) || (f.user1 === friendId && f.user2 === userId))
      );
      saveToMockDb('friends', filtered);
    }
  },

  // 6. Get mutual friends list
  async getMutualFriends(userId: string, targetUserId: string): Promise<UserProfile[]> {
    const userFriends = await this.getFriends(userId);
    const targetFriends = await this.getFriends(targetUserId);

    const userFriendsIds = new Set(userFriends.map(f => f.friend_id));
    const mutuals: UserProfile[] = [];

    for (const f of targetFriends) {
      if (userFriendsIds.has(f.friend_id) && f.friend_profile) {
        mutuals.push(f.friend_profile);
      }
    }
    return mutuals;
  },

  // 7. Toggle Favorite status
  async toggleFavoriteFriend(friendshipId: string, isFavorite: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('friends')
        .update({ favorite: isFavorite })
        .eq('id', friendshipId);
      if (error) throw error;
    } else {
      const friendships = getFromMockDb<Friend>('friends');
      const idx = friendships.findIndex(f => f.id === friendshipId);
      if (idx !== -1) {
        friendships[idx].favorite = isFavorite;
        saveToMockDb('friends', friendships);
      }
    }
  }
};
