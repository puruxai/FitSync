// FitSync Leaderboard Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles fetching user scores filtered by category, period, demographics, and social scopes

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { FriendService } from './friend';

export interface LeaderboardScore {
  id: string;
  user_id: string;
  category: 'steps' | 'calories' | 'workout_minutes' | 'water' | 'weight_loss' | 'bmi_improvement' | 'challenge_wins' | 'workout_streak' | 'activity_score';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  score: number;
  trend: 'moved_up' | 'moved_down' | 'no_change';
  level: number;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
    fitsync_id: string;
    gender?: string;
    age?: number;
    location?: string;
    fitness_goal?: string;
  };
}

export interface LeaderboardFilters {
  category: LeaderboardScore['category'];
  period: LeaderboardScore['period'];
  scope: 'global' | 'friends';
  gender?: string;
  ageGroup?: 'under_20' | '20_29' | '30_39' | '40_49' | '50_plus';
  fitnessGoal?: string;
  location?: string; // e.g. Country/State/City
  limit?: number;
  offset?: number;
}

export const LeaderboardService = {
  /**
   * Fetch rankings based on filters
   */
  async getRankings(userId: string, filters: LeaderboardFilters): Promise<LeaderboardScore[]> {
    const {
      category,
      period,
      scope,
      gender,
      ageGroup,
      fitnessGoal,
      location,
      limit = 50,
      offset = 0
    } = filters;

    if (isSupabaseConfigured) {
      let query = supabase
        .from('leaderboard_scores')
        .select('*, profile:profiles(*)')
        .eq('category', category)
        .eq('period', period)
        .order('score', { ascending: false });

      // Scope filter
      if (scope === 'friends') {
        const friendsList = await FriendService.getFriends(userId);
        const userIds = friendsList.map(f => f.friend_profile?.id).filter(Boolean) as string[];
        userIds.push(userId); // Include self
        query = query.in('user_id', userIds);
      }

      // Profile demographics filter joins
      if (gender) {
        query = query.eq('profile.gender', gender);
      }
      if (fitnessGoal) {
        query = query.eq('profile.fitness_goal', fitnessGoal);
      }
      if (location) {
        query = query.ilike('profile.location', `%${location}%`);
      }

      // Fetch
      const { data, error } = await query;
      if (error) throw error;

      let results = (data as unknown as LeaderboardScore[]) || [];

      // Filter null profiles out (RLS blocks, or non-matching demographic joins)
      results = results.filter(row => row.profile !== null);

      // Manual age group filter since client-side filtering makes age-group logic simpler
      if (ageGroup) {
        results = results.filter(row => {
          const age = row.profile?.age;
          if (age === undefined) return false;
          if (ageGroup === 'under_20') return age < 20;
          if (ageGroup === '20_29') return age >= 20 && age <= 29;
          if (ageGroup === '30_39') return age >= 30 && age <= 39;
          if (ageGroup === '40_49') return age >= 40 && age <= 49;
          return age >= 50;
        });
      }

      // Pagination
      return results.slice(offset, offset + limit);
    } else {
      // Local Mock DB Fallback
      const scores = getFromMockDb<LeaderboardScore>('leaderboard_scores');
      const profiles = getFromMockDb<any>('profiles');

      // Default mock seeding if empty
      if (scores.length === 0) {
        this.seedMockScores(profiles);
      }

      let filtered = getFromMockDb<LeaderboardScore>('leaderboard_scores')
        .filter(s => s.category === category && s.period === period)
        .map(s => ({
          ...s,
          profile: profiles.find((p: any) => p.id === s.user_id)
        }))
        .filter(s => s.profile !== null)
        .sort((a, b) => b.score - a.score);

      // Scope filter
      if (scope === 'friends') {
        const friendsList = await FriendService.getFriends(userId);
        const friendIds = friendsList.map(f => f.friend_id).filter(Boolean) as string[];
        friendIds.push(userId);
        filtered = filtered.filter(s => friendIds.includes(s.user_id));
      }

      // Gender filter
      if (gender) {
        filtered = filtered.filter(s => s.profile?.gender === gender);
      }

      // Goal filter
      if (fitnessGoal) {
        filtered = filtered.filter(s => s.profile?.fitness_goal === fitnessGoal);
      }

      // Location filter
      if (location) {
        filtered = filtered.filter(s => 
          s.profile?.location?.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Age group filter
      if (ageGroup) {
        filtered = filtered.filter(row => {
          const age = row.profile?.age;
          if (age === undefined) return false;
          if (ageGroup === 'under_20') return age < 20;
          if (ageGroup === '20_29') return age >= 20 && age <= 29;
          if (ageGroup === '30_39') return age >= 30 && age <= 39;
          if (ageGroup === '40_49') return age >= 40 && age <= 49;
          return age >= 50;
        });
      }

      return filtered.slice(offset, offset + limit);
    }
  },

  /**
   * Update score
   */
  async submitScore(
    userId: string,
    score: number,
    category: LeaderboardFilters['category'],
    period: LeaderboardFilters['period']
  ): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('leaderboard_scores')
        .upsert({
          user_id: userId,
          category,
          period,
          score,
          trend: 'no_change',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,category,period' });
    } else {
      const scores = getFromMockDb<LeaderboardScore>('leaderboard_scores');
      const idx = scores.findIndex(s => s.user_id === userId && s.category === category && s.period === period);

      if (idx !== -1) {
        const oldScore = scores[idx].score;
        scores[idx].score = score;
        scores[idx].trend = score > oldScore ? 'moved_up' : score < oldScore ? 'moved_down' : 'no_change';
        scores[idx].updated_at = new Date().toISOString();
      } else {
        scores.push({
          id: 'scr-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          category,
          period,
          score,
          trend: 'no_change',
          level: 3,
          updated_at: new Date().toISOString()
        });
      }
      saveToMockDb('leaderboard_scores', scores);
    }
  },

  /**
   * Seed Mock scores if they don't exist
   */
  seedMockScores(profiles: any[]) {
    const categories: LeaderboardFilters['category'][] = [
      'steps', 'calories', 'workout_minutes', 'water', 'weight_loss', 'bmi_improvement', 'challenge_wins', 'workout_streak', 'activity_score'
    ];
    const periods: LeaderboardFilters['period'][] = ['daily', 'weekly', 'monthly', 'yearly', 'all_time'];
    const mockScores: LeaderboardScore[] = [];

    profiles.forEach(p => {
      categories.forEach(cat => {
        periods.forEach(per => {
          let score = Math.floor(Math.random() * 8000) + 1500;
          if (cat === 'workout_minutes') score = Math.floor(Math.random() * 300) + 40;
          if (cat === 'water') score = Math.floor(Math.random() * 4000) + 1000;
          if (cat === 'weight_loss') score = parseFloat((Math.random() * 6).toFixed(1));
          if (cat === 'challenge_wins') score = Math.floor(Math.random() * 5);
          if (cat === 'workout_streak') score = Math.floor(Math.random() * 12) + 1;

          mockScores.push({
            id: `scr-${p.id}-${cat}-${per}`,
            user_id: p.id,
            category: cat,
            period: per,
            score,
            trend: Math.random() > 0.6 ? 'moved_up' : Math.random() > 0.4 ? 'moved_down' : 'no_change',
            level: Math.floor(Math.random() * 8) + 1,
            updated_at: new Date().toISOString()
          });
        });
      });
    });

    saveToMockDb('leaderboard_scores', mockScores);
  },

  /**
   * Legacy Compatibility: Get steps rankings for a period
   */
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly'): Promise<any[]> {
    const data = await this.getRankings('', { category: 'steps', period: period as any, scope: 'global' });
    return data.map(item => ({
      ...item,
      profile_id: item.user_id,
      steps_total: item.score,
      calories_total: Math.floor(item.score * 0.04)
    }));
  },

  /**
   * Legacy Compatibility: Set a user's steps score
   */
  async updateScore(userId: string, score: number, period: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    return this.submitScore(userId, score, 'steps', period as any);
  }
};
