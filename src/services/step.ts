// FitSync Step Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles step record insertions, updates, history fetches, and calorie estimations

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface StepLog {
  id: string;
  user_id: string;
  steps: number;
  calories_burned: number;
  date: string;
  created_at: string;
}

export const StepService = {
  /**
   * Log steps for a specific day
   */
  async logSteps(userId: string, steps: number, caloriesBurned?: number, dateStr?: string): Promise<StepLog> {
    const date = dateStr || new Date().toISOString().split('T')[0];
    const cals = caloriesBurned ?? Math.round(steps * 0.04); // standard estimation (0.04 kcal per step)

    if (isSupabaseConfigured) {
      // Check if entry exists for this date and user
      const { data: existing } = await supabase
        .from('step_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('step_logs')
          .update({
            steps: steps,
            calories_burned: cals
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('step_logs')
          .insert({
            user_id: userId,
            steps,
            calories_burned: cals,
            date
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Sync step record into calorie_logs as burned calories
      await supabase
        .from('calorie_logs')
        .upsert({
          user_id: userId,
          calories: cals,
          type: 'burned',
          description: `Steps Walked (${steps} steps)`,
          date
        }, { onConflict: 'user_id,date,description' }); // upsert based on description helper

      return result as unknown as StepLog;
    } else {
      const logs = getFromMockDb<StepLog>('step_logs');
      const idx = logs.findIndex(l => l.user_id === userId && l.date === date);
      
      let updated: StepLog;
      if (idx !== -1) {
        updated = {
          ...logs[idx],
          steps,
          calories_burned: cals
        };
        logs[idx] = updated;
      } else {
        updated = {
          id: 'step-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          steps,
          calories_burned: cals,
          date,
          created_at: new Date().toISOString()
        };
        logs.push(updated);
      }
      saveToMockDb('step_logs', logs);

      // Sync to local calorie logs
      const cLogs = getFromMockDb<any>('calorie_logs');
      const cIdx = cLogs.findIndex((c: any) => c.user_id === userId && c.date === date && c.description?.includes('Steps'));
      if (cIdx !== -1) {
        cLogs[cIdx].calories = cals;
      } else {
        cLogs.push({
          id: 'cal-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          calories: cals,
          type: 'burned',
          description: `Steps Walked (${steps} steps)`,
          date,
          created_at: new Date().toISOString()
        });
      }
      saveToMockDb('calorie_logs', cLogs);

      return updated;
    }
  },

  /**
   * Fetch step logs history
   */
  async getStepLogs(userId: string, range: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StepLog[]> {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('step_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      const today = new Date();
      if (range === 'week') {
        const pastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        query = query.gte('date', pastWeek);
      } else if (range === 'month') {
        const pastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString().split('T')[0];
        query = query.gte('date', pastMonth);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as StepLog[]) || [];
    } else {
      const logs = getFromMockDb<StepLog>('step_logs');
      const userLogs = logs.filter(l => l.user_id === userId);
      
      const today = new Date();
      const checkDate = (dateStr: string, daysLimit: number) => {
        const d = new Date(dateStr);
        const diff = Math.ceil(Math.abs(today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return diff <= daysLimit;
      };

      if (range === 'week') {
        return userLogs.filter(l => checkDate(l.date, 7)).sort((a, b) => b.date.localeCompare(a.date));
      } else if (range === 'month') {
        return userLogs.filter(l => checkDate(l.date, 30)).sort((a, b) => b.date.localeCompare(a.date));
      }
      return userLogs.sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  /**
   * Delete steps record
   */
  async deleteStepLog(logId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('step_logs')
        .delete()
        .eq('id', logId);
      if (error) throw error;
    } else {
      const logs = getFromMockDb<StepLog>('step_logs');
      const filtered = logs.filter(l => l.id !== logId);
      saveToMockDb('step_logs', filtered);
    }
  }
};
