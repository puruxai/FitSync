// FitSync Workout History Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles completing workout sessions, syncing results, and updating challenge progress

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { FitnessService } from './fitness';
import { ChallengeProgressService } from './challengeProgress';

export interface WorkoutHistoryItem {
  id: string;
  user_id: string;
  workout_id?: string;
  workout_name: string;
  duration_minutes: number;
  calories_burned: number;
  completion_percent: number;
  exercises_completed: number;
  logged_date: string; // YYYY-MM-DD
  created_at: string;
}

export const WorkoutHistoryService = {
  /**
   * Log completed workout session
   */
  async logSession(
    userId: string,
    workoutId: string | undefined,
    workoutName: string,
    durationMinutes: number,
    caloriesBurned: number,
    completionPercent: number,
    exercisesCompleted: number,
    category: string
  ): Promise<WorkoutHistoryItem> {
    const loggedDate = new Date().toISOString().split('T')[0];

    // 1. Save History Item
    let item: WorkoutHistoryItem;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_history')
        .insert({
          user_id: userId,
          workout_id: workoutId,
          workout_name: workoutName,
          duration_minutes: durationMinutes,
          calories_burned: caloriesBurned,
          completion_percent: completionPercent,
          exercises_completed: exercisesCompleted,
          logged_date: loggedDate
        })
        .select()
        .single();
      if (error) throw error;
      item = data as unknown as WorkoutHistoryItem;
    } else {
      const list = getFromMockDb<WorkoutHistoryItem>('workout_history');
      item = {
        id: 'wh-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        workout_id: workoutId,
        workout_name: workoutName,
        duration_minutes: durationMinutes,
        calories_burned: caloriesBurned,
        completion_percent: completionPercent,
        exercises_completed: exercisesCompleted,
        logged_date: loggedDate,
        created_at: new Date().toISOString()
      };
      list.push(item);
      saveToMockDb('workout_history', list);
    }

    // 2. Route to FitnessService (recalculates streaks and updates dashboard)
    await FitnessService.logWorkout(userId, workoutName, category, durationMinutes, caloriesBurned);

    // 3. Realtime Challenge sync (check active challenges for 'workout_minutes' or 'calories' or 'custom' and sync!)
    try {
      if (isSupabaseConfigured) {
        // Query user joined challenges
        const { data: memberIn } = await supabase
          .from('challenge_members')
          .select('challenge_id, challenge:challenges(*)');
        
        if (memberIn) {
          for (const mem of memberIn) {
            const ch = (mem as any).challenge;
            if (ch && (ch.category === 'workout_minutes' || ch.category === 'calories' || ch.category === 'custom')) {
              await ChallengeProgressService.updateProgress(ch.id, userId, ch.category);
            }
          }
        }
      } else {
        const members = getFromMockDb<any>('challenge_members');
        const challenges = getFromMockDb<any>('challenges');
        const userMem = members.filter((m: any) => m.user_id === userId);

        for (const mem of userMem) {
          const ch = challenges.find((c: any) => c.id === mem.challenge_id);
          if (ch && (ch.category === 'workout_minutes' || ch.category === 'calories' || ch.category === 'custom')) {
            await ChallengeProgressService.updateProgress(ch.id, userId, ch.category);
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync challenge progress from workout history:', err);
    }

    return item;
  },

  /**
   * Get history logs list
   */
  async getHistory(userId: string): Promise<WorkoutHistoryItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', userId)
        .order('logged_date', { ascending: false });
      if (error) throw error;
      return (data as unknown as WorkoutHistoryItem[]) || [];
    } else {
      const list = getFromMockDb<WorkoutHistoryItem>('workout_history');
      return list
        .filter(h => h.user_id === userId)
        .sort((a, b) => (b.logged_date || '').localeCompare(a.logged_date || ''));
    }
  }
};
export default WorkoutHistoryService;
