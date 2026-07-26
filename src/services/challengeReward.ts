// FitSync Challenge Reward Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles awarding winner badges and claimable XP points upon challenge completions

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface ChallengeReward {
  id: string;
  challenge_id: string;
  user_id: string;
  reward_points: number;
  is_claimed: boolean;
  claimed_at?: string;
  challenge?: any;
}

export const ChallengeRewardService = {
  /**
   * Award completion reward to a user
   */
  async awardCompletion(challengeId: string, userId: string, points: number): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('challenge_rewards')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          reward_points: points,
          is_claimed: false
        });
        
      // Award winner badge
      await supabase
        .from('challenge_badges')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          title: 'Challenge Gold Conqueror'
        });
    } else {
      const rewards = getFromMockDb<ChallengeReward>('challenge_rewards');
      rewards.push({
        id: 'crew-' + Math.random().toString(36).substr(2, 9),
        challenge_id: challengeId,
        user_id: userId,
        reward_points: points,
        is_claimed: false
      });
      saveToMockDb('challenge_rewards', rewards);

      const badges = getFromMockDb<any>('challenge_badges');
      badges.push({
        id: 'cbdg-' + Math.random().toString(36).substr(2, 9),
        challenge_id: challengeId,
        user_id: userId,
        title: 'Challenge Gold Conqueror',
        awarded_at: new Date().toISOString()
      });
      saveToMockDb('challenge_badges', badges);
    }
  },

  /**
   * Get user rewards list
   */
  async getUserRewards(userId: string): Promise<ChallengeReward[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('challenge_rewards')
        .select('*, challenge:challenges(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return (data as unknown as ChallengeReward[]) || [];
    } else {
      const rewards = getFromMockDb<ChallengeReward>('challenge_rewards');
      const challenges = getFromMockDb<any>('challenges');

      return rewards
        .filter(r => r.user_id === userId)
        .map(r => ({
          ...r,
          challenge: challenges.find((c: any) => c.id === r.challenge_id)
        }));
    }
  },

  /**
   * Claim reward points
   */
  async claimReward(rewardId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('challenge_rewards')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('id', rewardId);
    } else {
      const rewards = getFromMockDb<ChallengeReward>('challenge_rewards');
      const idx = rewards.findIndex(r => r.id === rewardId);
      if (idx !== -1) {
        rewards[idx].is_claimed = true;
        rewards[idx].claimed_at = new Date().toISOString();
        saveToMockDb('challenge_rewards', rewards);
      }
    }
  }
};
