// FitSync Reward Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles querying and claiming badges/milestone rewards

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface LeaderboardBadge {
  id: string;
  user_id: string;
  badge_type: 'top_1' | 'top_3' | 'top_10' | 'weekly_winner' | 'monthly_champion' | 'fitness_legend' | 'consistency_master' | 'challenge_winner';
  title: string;
  image_url?: string;
  awarded_at: string;
}

export interface LeaderboardReward {
  id: string;
  user_id: string;
  title: string;
  reward_points: number;
  is_claimed: boolean;
  claimed_at?: string;
}

export const RewardService = {
  /**
   * Award a milestone badge to a user
   */
  async awardBadge(userId: string, type: LeaderboardBadge['badge_type'], title: string): Promise<LeaderboardBadge> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('leaderboard_badges')
        .insert({
          user_id: userId,
          badge_type: type,
          title
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as LeaderboardBadge;
    } else {
      const badges = getFromMockDb<LeaderboardBadge>('leaderboard_badges');
      const newBadge: LeaderboardBadge = {
        id: 'bdg-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        badge_type: type,
        title,
        awarded_at: new Date().toISOString()
      };
      badges.push(newBadge);
      saveToMockDb('leaderboard_badges', badges);
      return newBadge;
    }
  },

  /**
   * Get user badges
   */
  async getUserBadges(userId: string): Promise<LeaderboardBadge[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('leaderboard_badges')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return (data as unknown as LeaderboardBadge[]) || [];
    } else {
      const badges = getFromMockDb<LeaderboardBadge>('leaderboard_badges');
      return badges.filter(b => b.user_id === userId);
    }
  },

  /**
   * Get user rewards list
   */
  async getUserRewards(userId: string): Promise<LeaderboardReward[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('leaderboard_rewards')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return (data as unknown as LeaderboardReward[]) || [];
    } else {
      const rewards = getFromMockDb<LeaderboardReward>('leaderboard_rewards');
      
      // Initialize default mock rewards if none exist
      if (rewards.filter(r => r.user_id === userId).length === 0) {
        const defaults: LeaderboardReward[] = [
          { id: 'rew-1', user_id: userId, title: 'Weekly Top 3 Placement Bonus', reward_points: 500, is_claimed: false },
          { id: 'rew-2', user_id: userId, title: 'Consistent Stepper Milestone', reward_points: 250, is_claimed: true, claimed_at: new Date().toISOString() },
          { id: 'rew-3', user_id: userId, title: 'Activity Level Up Reward', reward_points: 1000, is_claimed: false }
        ];
        const updated = [...rewards, ...defaults];
        saveToMockDb('leaderboard_rewards', updated);
        return defaults;
      }
      return rewards.filter(r => r.user_id === userId);
    }
  },

  /**
   * Claim reward points
   */
  async claimReward(rewardId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('leaderboard_rewards')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('id', rewardId);
    } else {
      const rewards = getFromMockDb<LeaderboardReward>('leaderboard_rewards');
      const idx = rewards.findIndex(r => r.id === rewardId);
      if (idx !== -1) {
        rewards[idx].is_claimed = true;
        rewards[idx].claimed_at = new Date().toISOString();
        saveToMockDb('leaderboard_rewards', rewards);
      }
    }
  }
};
