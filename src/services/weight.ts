// FitSync Weight Service (Dual Mode: Supabase or Local Mock Fallback)
// Logs weight readings, calculates BMI score, and computes trend differences

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  bmi: number;
  date: string;
  created_at: string;
}

export const WeightService = {
  /**
   * Log weight & BMI
   */
  async logWeight(userId: string, weightKg: number, bmi: number, dateStr?: string): Promise<WeightLog> {
    const date = dateStr || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      // Check if entry exists for this date and user
      const { data: existing } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('weight_logs')
          .update({
            weight_kg: weightKg,
            bmi
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('weight_logs')
          .insert({
            user_id: userId,
            weight_kg: weightKg,
            bmi,
            date
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Sync current weight to public profile biometrics
      await supabase
        .from('profiles')
        .update({ weight: weightKg })
        .eq('id', userId);

      return result as unknown as WeightLog;
    } else {
      const logs = getFromMockDb<WeightLog>('weight_logs');
      const idx = logs.findIndex(l => l.user_id === userId && l.date === date);

      let updated: WeightLog;
      if (idx !== -1) {
        updated = {
          ...logs[idx],
          weight_kg: weightKg,
          bmi
        };
        logs[idx] = updated;
      } else {
        updated = {
          id: 'weight-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          weight_kg: weightKg,
          bmi,
          date,
          created_at: new Date().toISOString()
        };
        logs.push(updated);
      }
      saveToMockDb('weight_logs', logs);

      // Sync to local profiles list
      const profiles = getFromMockDb<any>('profiles');
      const pIdx = profiles.findIndex(p => p.id === userId);
      if (pIdx !== -1) {
        profiles[pIdx].weight = weightKg;
        saveToMockDb('profiles', profiles);
      }

      return updated;
    }
  },

  /**
   * Get weight logs history
   */
  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return (data as unknown as WeightLog[]) || [];
    } else {
      const logs = getFromMockDb<WeightLog>('weight_logs');
      return logs
        .filter(l => l.user_id === userId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  /**
   * Delete a weight log
   */
  async deleteWeightLog(logId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', logId);
      if (error) throw error;
    } else {
      const logs = getFromMockDb<WeightLog>('weight_logs');
      const filtered = logs.filter(l => l.id !== logId);
      saveToMockDb('weight_logs', filtered);
    }
  },

  /**
   * Calculate weight change since the first registered entry
   */
  async getWeightChange(userId: string): Promise<number> {
    const logs = await this.getWeightLogs(userId);
    if (logs.length < 2) return 0;
    // Current (latest date) minus initial (oldest date)
    const latest = logs[0].weight_kg;
    const initial = logs[logs.length - 1].weight_kg;
    return Number((latest - initial).toFixed(2));
  }
};
