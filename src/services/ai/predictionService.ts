// FitSync AI Progress Prediction Service
// Queries or simulates projections of weights, BMI indices, and goal success parameters

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface AIPrediction {
  id: string;
  user_id: string;
  metric_type: string;
  predicted_value: string;
  probability: number;
  created_at: string;
}

export const PredictionService = {
  /**
   * Get predictions list
   */
  async getPredictions(userId: string): Promise<AIPrediction[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return data as unknown as AIPrediction[];
      return this.seedDefaultPredictions(userId);
    } else {
      const list = getFromMockDb<AIPrediction>('ai_predictions');
      const filtered = list.filter(p => p.user_id === userId);
      if (filtered.length > 0) return filtered;
      return this.seedDefaultPredictions(userId);
    }
  },

  /**
   * Seed defaults
   */
  async seedDefaultPredictions(userId: string): Promise<AIPrediction[]> {
    const defaults: Omit<AIPrediction, 'id' | 'created_at'>[] = [
      { user_id: userId, metric_type: 'Weight Trend', predicted_value: 'Lose 1.8 kg over 4 weeks', probability: 88 },
      { user_id: userId, metric_type: 'BMI target', predicted_value: 'Decrease from 24.5 to 23.9', probability: 85 },
      { user_id: userId, metric_type: 'Consistency Rate', predicted_value: 'Maintain 85% workout frequency', probability: 90 },
      { user_id: userId, metric_type: 'Step Success', predicted_value: '92% probability of hitting 10k steps daily', probability: 92 }
    ];

    const records: AIPrediction[] = [];
    
    if (isSupabaseConfigured) {
      for (const item of defaults) {
        const { data, error } = await supabase
          .from('ai_predictions')
          .insert(item)
          .select()
          .single();
        if (!error && data) records.push(data as unknown as AIPrediction);
      }
    } else {
      const list = getFromMockDb<AIPrediction>('ai_predictions');
      defaults.forEach((item, idx) => {
        const record = {
          id: `pred-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          ...item,
          created_at: new Date().toISOString()
        };
        list.push(record);
        records.push(record);
      });
      saveToMockDb('ai_predictions', list);
    }

    return records;
  }
};
export default PredictionService;
