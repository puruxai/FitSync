// FitSync Goal Service (Dual Mode: Supabase or Local Mock Fallback)
// Manages customizable fitness targets for steps, hydration, weight, and calorie metrics

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface FitnessGoals {
  user_id: string;
  steps_goal: number;
  calories_goal: number;
  workout_minutes_goal: number;
  water_ml_goal: number;
  weight_goal?: number;
}

export const GoalService = {
  /**
   * Fetch goals for a user
   */
  async getGoals(userId: string): Promise<FitnessGoals> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create defaults if missing
        const defaults: FitnessGoals = {
          user_id: userId,
          steps_goal: 10000,
          calories_goal: 2500,
          workout_minutes_goal: 30,
          water_ml_goal: 2500,
          weight_goal: 70.0
        };
        const { data: inserted, error: insertError } = await supabase
          .from('fitness_goals')
          .insert(defaults)
          .select()
          .single();
        if (insertError) throw insertError;
        return inserted as unknown as FitnessGoals;
      }

      return data as unknown as FitnessGoals;
    } else {
      const goalsList = getFromMockDb<FitnessGoals>('fitness_goals');
      let rec = goalsList.find(g => g.user_id === userId);
      
      if (!rec) {
        rec = {
          user_id: userId,
          steps_goal: 10000,
          calories_goal: 2500,
          workout_minutes_goal: 30,
          water_ml_goal: 2500,
          weight_goal: 70.0
        };
        goalsList.push(rec);
        saveToMockDb('fitness_goals', goalsList);
      }
      return rec;
    }
  },

  /**
   * Update fitness goals
   */
  async updateGoals(userId: string, updates: Partial<FitnessGoals>): Promise<FitnessGoals> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('fitness_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FitnessGoals;
    } else {
      const goalsList = getFromMockDb<FitnessGoals>('fitness_goals');
      const idx = goalsList.findIndex(g => g.user_id === userId);
      
      let updated: FitnessGoals;
      if (idx !== -1) {
        updated = { ...goalsList[idx], ...updates };
        goalsList[idx] = updated;
      } else {
        updated = {
          user_id: userId,
          steps_goal: updates.steps_goal ?? 10000,
          calories_goal: updates.calories_goal ?? 2500,
          workout_minutes_goal: updates.workout_minutes_goal ?? 30,
          water_ml_goal: updates.water_ml_goal ?? 2500,
          weight_goal: updates.weight_goal ?? 70.0
        };
        goalsList.push(updated);
      }
      saveToMockDb('fitness_goals', goalsList);
      return updated;
    }
  }
};
