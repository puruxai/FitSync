// FitSync Calorie Service (Dual Mode: Supabase or Local Mock Fallback)
// Manages food intake and calorie expenditure logs

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface CalorieLog {
  id: string;
  user_id: string;
  calories: number;
  type: 'intake' | 'burned';
  description?: string;
  date: string;
  created_at: string;
}

export const CalorieService = {
  /**
   * Log intake/burned calories
   */
  async logCalorie(
    userId: string, 
    calories: number, 
    type: 'intake' | 'burned', 
    description?: string, 
    dateStr?: string
  ): Promise<CalorieLog> {
    const date = dateStr || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('calorie_logs')
        .insert({
          user_id: userId,
          calories,
          type,
          description: description || (type === 'intake' ? 'Meal Intake' : 'Active Burn'),
          date
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as CalorieLog;
    } else {
      const logs = getFromMockDb<CalorieLog>('calorie_logs');
      const newLog: CalorieLog = {
        id: 'cal-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        calories,
        type,
        description: description || (type === 'intake' ? 'Meal Intake' : 'Active Burn'),
        date,
        created_at: new Date().toISOString()
      };
      logs.push(newLog);
      saveToMockDb('calorie_logs', logs);
      return newLog;
    }
  },

  /**
   * Fetch calorie log records
   */
  async getCalorieLogs(userId: string, dateStr?: string): Promise<CalorieLog[]> {
    const date = dateStr || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('calorie_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as CalorieLog[]) || [];
    } else {
      const logs = getFromMockDb<CalorieLog>('calorie_logs');
      return logs
        .filter(l => l.user_id === userId && l.date === date)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
  },

  /**
   * Fetch calorie sums for weekly/monthly ranges
   */
  async getCalorieRangeLogs(userId: string, daysLimit = 7): Promise<CalorieLog[]> {
    if (isSupabaseConfigured) {
      const today = new Date();
      const pastDate = new Date(today.getTime() - daysLimit * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('calorie_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', pastDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return (data as unknown as CalorieLog[]) || [];
    } else {
      const logs = getFromMockDb<CalorieLog>('calorie_logs');
      const today = new Date();
      return logs.filter(l => {
        if (l.user_id !== userId) return false;
        const d = new Date(l.date);
        const diff = Math.ceil(Math.abs(today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return diff <= daysLimit;
      });
    }
  },

  /**
   * Delete a calorie log
   */
  async deleteCalorieLog(logId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('calorie_logs')
        .delete()
        .eq('id', logId);
      if (error) throw error;
    } else {
      const logs = getFromMockDb<CalorieLog>('calorie_logs');
      const filtered = logs.filter(l => l.id !== logId);
      saveToMockDb('calorie_logs', filtered);
    }
  }
};
