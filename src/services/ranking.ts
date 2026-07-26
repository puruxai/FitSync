// FitSync Ranking Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles logging user historical ranks and fetching rank trend metrics over time

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface UserRankHistory {
  id: string;
  user_id: string;
  rank: number;
  period: string;
  recorded_at: string;
}

export const RankingService = {
  /**
   * Log current rank history snapshot
   */
  async logRankSnapshot(userId: string, rank: number, period: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      await supabase
        .from('user_rank_history')
        .insert({
          user_id: userId,
          rank,
          period,
          recorded_at: today
        });
    } else {
      const history = getFromMockDb<UserRankHistory>('user_rank_history');
      history.push({
        id: 'rnk-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        rank,
        period,
        recorded_at: today
      });
      saveToMockDb('user_rank_history', history);
    }
  },

  /**
   * Get user rank history over time
   */
  async getUserRankHistory(userId: string, period: string): Promise<UserRankHistory[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('user_rank_history')
        .select('*')
        .eq('user_id', userId)
        .eq('period', period)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return (data as unknown as UserRankHistory[]) || [];
    } else {
      const history = getFromMockDb<UserRankHistory>('user_rank_history');
      const filtered = history.filter(h => h.user_id === userId && h.period === period);

      // Initialize default mock history if none exists for charts visual representation
      if (filtered.length === 0) {
        const mockData: UserRankHistory[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            id: `rnk-m-${i}`,
            user_id: userId,
            rank: Math.floor(Math.random() * 8) + 1,
            period,
            recorded_at: date.toISOString().split('T')[0]
          });
        }
        return mockData;
      }
      return filtered.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    }
  }
};
