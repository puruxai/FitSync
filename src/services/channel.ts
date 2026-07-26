// FitSync Channel Service (Dual Mode: Supabase or Local Mock Fallback)
// Manages subscribing and broadcasting on Supabase Realtime Channels

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ChannelService = {
  /**
   * Create presence channel subscription
   */
  subscribePresence(userId: string, onSync: (presenceState: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase.channel(`presence:${userId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        onSync(channel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId
          });
        }
      });

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  /**
   * Create fitness metrics subscription
   */
  subscribeFitness(userId: string, onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel(`fitness:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'step_logs', filter: `user_id=eq.${userId}` },
        (payload) => onUpdate({ type: 'steps', payload })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'water_logs', filter: `user_id=eq.${userId}` },
        (payload) => onUpdate({ type: 'water', payload })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_logs', filter: `user_id=eq.${userId}` },
        (payload) => onUpdate({ type: 'workout', payload })
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  /**
   * Create friends updates channel
   */
  subscribeFriends(userId: string, onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel(`friends:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friends', filter: `user1=eq.${userId}` },
        (payload) => onUpdate({ type: 'friend', payload })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friends', filter: `user2=eq.${userId}` },
        (payload) => onUpdate({ type: 'friend', payload })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${userId}` },
        (payload) => onUpdate({ type: 'request', payload })
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  /**
   * Create notifications channel
   */
  subscribeNotifications(userId: string, onNotify: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => onNotify(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friend_notifications', filter: `user_id=eq.${userId}` },
        (payload) => onNotify(payload.new)
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  /**
   * Create leaderboard channel
   */
  subscribeLeaderboard(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('leaderboard-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fitness_statistics' },
        (payload) => onUpdate(payload)
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  /**
   * Create challenges channel
   */
  subscribeChallenges(challengeId: string, onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel(`challenge:${challengeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenge_members', filter: `challenge_id=eq.${challengeId}` },
        (payload) => onUpdate(payload)
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
};
