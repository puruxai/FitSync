// FitSync Planner Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles scheduling workout plans and assigning workouts to weekly calendar slots

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { WorkoutService } from './workout';

export interface WorkoutPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface PlannedWorkout {
  id: string;
  plan_id: string;
  workout_id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time_of_day?: string; // "07:00"
  workout?: any;
}

export const PlannerService = {
  /**
   * Get all plans for user
   */
  async getPlans(userId: string): Promise<WorkoutPlan[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      if (!data || data.length === 0) {
        return [await this.createPlan(userId, 'My Weekly Plan Routine', 'Default starter schedule')];
      }
      return data as unknown as WorkoutPlan[];
    } else {
      const list = getFromMockDb<WorkoutPlan>('workout_plans');
      const filtered = list.filter(p => p.user_id === userId);
      if (filtered.length === 0) {
        return [await this.createPlan(userId, 'My Weekly Plan Routine', 'Default starter schedule')];
      }
      return filtered;
    }
  },

  /**
   * Create plan
   */
  async createPlan(userId: string, title: string, description?: string): Promise<WorkoutPlan> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert({ user_id: userId, title, description, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as WorkoutPlan;
    } else {
      const list = getFromMockDb<WorkoutPlan>('workout_plans');
      const newPlan: WorkoutPlan = {
        id: 'plan-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        title,
        description,
        is_active: true,
        created_at: new Date().toISOString()
      };
      list.push(newPlan);
      saveToMockDb('workout_plans', list);
      return newPlan;
    }
  },

  /**
   * Delete Plan
   */
  async deletePlan(planId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);
    } else {
      const list = getFromMockDb<WorkoutPlan>('workout_plans');
      const filtered = list.filter(p => p.id !== planId);
      saveToMockDb('workout_plans', filtered);

      // Cascade delete schedules
      const scheds = getFromMockDb<PlannedWorkout>('planned_workouts');
      const filteredScheds = scheds.filter(s => s.plan_id !== planId);
      saveToMockDb('planned_workouts', filteredScheds);
    }
  },

  /**
   * Duplicate Plan
   */
  async duplicatePlan(planId: string, newTitle: string): Promise<WorkoutPlan> {
    if (isSupabaseConfigured) {
      const { data: orig, error: origErr } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', planId)
        .single();
      if (origErr) throw origErr;

      const newPlan = await this.createPlan(orig.user_id, newTitle, orig.description);
      
      const { data: scheds } = await supabase
        .from('planned_workouts')
        .select('*')
        .eq('plan_id', planId);

      if (scheds && scheds.length > 0) {
        const inserts = scheds.map(s => ({
          plan_id: newPlan.id,
          workout_id: s.workout_id,
          day_of_week: s.day_of_week,
          time_of_day: s.time_of_day
        }));
        await supabase.from('planned_workouts').insert(inserts);
      }
      return newPlan;
    } else {
      const list = getFromMockDb<WorkoutPlan>('workout_plans');
      const orig = list.find(p => p.id === planId);
      if (!orig) throw new Error('Original plan not found');

      const newPlan = await this.createPlan(orig.user_id, newTitle, orig.description);
      
      const scheds = getFromMockDb<PlannedWorkout>('planned_workouts');
      const origScheds = scheds.filter(s => s.plan_id === planId);

      origScheds.forEach(s => {
        scheds.push({
          id: 'pw-' + Math.random().toString(36).substr(2, 9),
          plan_id: newPlan.id,
          workout_id: s.workout_id,
          day_of_week: s.day_of_week,
          time_of_day: s.time_of_day
        });
      });
      saveToMockDb('planned_workouts', scheds);
      return newPlan;
    }
  },

  /**
   * Get planned workouts schedule
   */
  async getPlannedWorkouts(planId: string): Promise<PlannedWorkout[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('planned_workouts')
        .select('*, workout:workouts(*)')
        .eq('plan_id', planId);
      if (error) throw error;
      return (data as unknown as PlannedWorkout[]) || [];
    } else {
      const scheds = getFromMockDb<PlannedWorkout>('planned_workouts');
      const workouts = await WorkoutService.getWorkouts();

      return scheds
        .filter(s => s.plan_id === planId)
        .map(s => ({
          ...s,
          workout: workouts.find(w => w.id === s.workout_id)
        }));
    }
  },

  /**
   * Assign workout to schedule slot
   */
  async assignWorkout(planId: string, workoutId: string, dayOfWeek: PlannedWorkout['day_of_week'], timeOfDay: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('planned_workouts')
        .insert({
          plan_id: planId,
          workout_id: workoutId,
          day_of_week: dayOfWeek,
          time_of_day: timeOfDay
        });
    } else {
      const scheds = getFromMockDb<PlannedWorkout>('planned_workouts');
      scheds.push({
        id: 'pw-' + Math.random().toString(36).substr(2, 9),
        plan_id: planId,
        workout_id: workoutId,
        day_of_week: dayOfWeek,
        time_of_day: timeOfDay
      });
      saveToMockDb('planned_workouts', scheds);
    }
  },

  /**
   * Delete planned workout schedule slot
   */
  async deletePlannedWorkout(scheduleId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('planned_workouts')
        .delete()
        .eq('id', scheduleId);
    } else {
      const scheds = getFromMockDb<PlannedWorkout>('planned_workouts');
      const filtered = scheds.filter(s => s.id !== scheduleId);
      saveToMockDb('planned_workouts', filtered);
    }
  }
};
export default PlannerService;
