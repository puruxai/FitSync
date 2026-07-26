// FitSync Challenge Progress Service (Dual Mode: Supabase or Local Mock Fallback)
// Syncs participant progress and calculates completion milestones

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { FitnessService } from './fitness';

export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string;
  value: number;
  updated_at: string;
  profile?: any;
}

export const ChallengeProgressService = {
  /**
   * Recalculate and update progress for user in a challenge
   */
  async updateProgress(challengeId: string, userId: string, category: string): Promise<number> {
    // 1. Fetch current metrics value from fitness summaries
    const logs = await FitnessService.getTodayLog(userId);
    let value = 0;
    
    if (category === 'steps') value = logs.steps;
    else if (category === 'calories') value = logs.calories;
    else if (category === 'workout_minutes') value = logs.workout_minutes;
    else if (category === 'water') value = logs.water;
    else value = Math.floor(Math.random() * 5) + 1; // custom default mock increment

    // 2. Upsert progress record
    if (isSupabaseConfigured) {
      await supabase
        .from('challenge_progress')
        .upsert({
          challenge_id: challengeId,
          user_id: userId,
          value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'challenge_id,user_id' });
    } else {
      const progressList = getFromMockDb<ChallengeProgress>('challenge_progress');
      const idx = progressList.findIndex(p => p.challenge_id === challengeId && p.user_id === userId);

      if (idx !== -1) {
        progressList[idx].value = value;
        progressList[idx].updated_at = new Date().toISOString();
      } else {
        progressList.push({
          id: 'cpr-' + Math.random().toString(36).substr(2, 9),
          challenge_id: challengeId,
          user_id: userId,
          value,
          updated_at: new Date().toISOString()
        });
      }
      saveToMockDb('challenge_progress', progressList);
    }
    return value;
  },

  /**
   * Get progress listing for challenge
   */
  async getChallengeProgress(challengeId: string): Promise<ChallengeProgress[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*, profile:profiles(*)')
        .eq('challenge_id', challengeId);

      if (error) throw error;
      return (data as unknown as ChallengeProgress[]) || [];
    } else {
      const progressList = getFromMockDb<ChallengeProgress>('challenge_progress');
      const profiles = getFromMockDb<any>('profiles');

      return progressList
        .filter(p => p.challenge_id === challengeId)
        .map(p => ({
          ...p,
          profile: profiles.find((prof: any) => prof.id === p.user_id)
        }));
    }
  }
};
