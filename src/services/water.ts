// FitSync Water Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles daily hydration logging, quick additions, and logs histories

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  date: string;
  created_at: string;
}

export const WaterService = {
  /**
   * Log water intake
   */
  async logWater(userId: string, amountMl: number, dateStr?: string): Promise<WaterLog> {
    const date = dateStr || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      // Check if water record exists for user on this date
      const { data: existing } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      let result;
      if (existing) {
        // Increment existing
        const { data, error } = await supabase
          .from('water_logs')
          .update({
            amount_ml: existing.amount_ml + amountMl
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('water_logs')
          .insert({
            user_id: userId,
            amount_ml: amountMl,
            date
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return result as unknown as WaterLog;
    } else {
      const logs = getFromMockDb<WaterLog>('water_logs');
      const idx = logs.findIndex(l => l.user_id === userId && l.date === date);
      
      let updated: WaterLog;
      if (idx !== -1) {
        updated = {
          ...logs[idx],
          amount_ml: logs[idx].amount_ml + amountMl
        };
        logs[idx] = updated;
      } else {
        updated = {
          id: 'water-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          amount_ml: amountMl,
          date,
          created_at: new Date().toISOString()
        };
        logs.push(updated);
      }
      saveToMockDb('water_logs', logs);
      return updated;
    }
  },

  /**
   * Get water logs history
   */
  async getWaterLogs(userId: string): Promise<WaterLog[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return (data as unknown as WaterLog[]) || [];
    } else {
      const logs = getFromMockDb<WaterLog>('water_logs');
      return logs
        .filter(l => l.user_id === userId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  /**
   * Delete a water log
   */
  async deleteWaterLog(logId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('water_logs')
        .delete()
        .eq('id', logId);
      if (error) throw error;
    } else {
      const logs = getFromMockDb<WaterLog>('water_logs');
      const filtered = logs.filter(l => l.id !== logId);
      saveToMockDb('water_logs', filtered);
    }
  }
};
