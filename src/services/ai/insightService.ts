// FitSync AI Insights Service
// Manages fetching weekly summaries, strength/weakness evaluations, and active coaching notes

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface AIInsight {
  id: string;
  user_id: string;
  category: string;
  insight: string;
  strength_analysis?: string;
  weakness_analysis?: string;
  created_at: string;
}

export const InsightService = {
  /**
   * Get insights list
   */
  async getInsights(userId: string): Promise<AIInsight[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return data as unknown as AIInsight[];
      return this.seedDefaultInsights(userId);
    } else {
      const list = getFromMockDb<AIInsight>('ai_insights');
      const filtered = list.filter(i => i.user_id === userId);
      if (filtered.length > 0) return filtered;
      return this.seedDefaultInsights(userId);
    }
  },

  /**
   * Seed default insights
   */
  async seedDefaultInsights(userId: string): Promise<AIInsight[]> {
    const defaults: Omit<AIInsight, 'id' | 'created_at'>[] = [
      {
        user_id: userId,
        category: 'Weekly Summary',
        insight: 'Your steps activity increased by 12% compared to last week. Keep up the high energy!',
        strength_analysis: 'High consistency on morning workouts, averaging 32 minutes per session.',
        weakness_analysis: 'Slight decrease in hydration on Thursday and Friday afternoons.'
      },
      {
        user_id: userId,
        category: 'Strength Analysis',
        insight: 'Core stability has improved significantly. Plank duration capacity is up 15 seconds.',
        strength_analysis: 'Strong transverse abdominis activation and back postural support.',
        weakness_analysis: 'Upper chest endurance is lagging behind lower body squats.'
      }
    ];

    const records: AIInsight[] = [];

    if (isSupabaseConfigured) {
      for (const item of defaults) {
        const { data, error } = await supabase
          .from('ai_insights')
          .insert(item)
          .select()
          .single();
        if (!error && data) records.push(data as unknown as AIInsight);
      }
    } else {
      const list = getFromMockDb<AIInsight>('ai_insights');
      defaults.forEach((item, idx) => {
        const record = {
          id: `ins-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          ...item,
          created_at: new Date().toISOString()
        };
        list.push(record);
        records.push(record);
      });
      saveToMockDb('ai_insights', list);
    }

    return records;
  }
};
export default InsightService;
