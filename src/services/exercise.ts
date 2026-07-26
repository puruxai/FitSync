// FitSync Exercise Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles querying exercise lists and media configurations for workout tracks

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  rest_time: number; // seconds
  target_muscle?: string;
  instructions?: string[];
  animation_url?: string;
}

export const ExerciseService = {
  /**
   * Fetch exercises for a workout
   */
  async getExercises(workoutId: string): Promise<Exercise[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', workoutId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return this.seedMockExercises(workoutId);
      }
      return data as unknown as Exercise[];
    } else {
      const list = getFromMockDb<Exercise>('exercises');
      const filtered = list.filter(e => e.workout_id === workoutId);
      if (filtered.length === 0) {
        return this.seedMockExercises(workoutId);
      }
      return filtered;
    }
  },

  /**
   * Seed mock exercises
   */
  async seedMockExercises(workoutId: string): Promise<Exercise[]> {
    const list: Exercise[] = [
      {
        id: 'ex-1-' + workoutId,
        workout_id: workoutId,
        name: 'Jumping Jacks Warmup',
        sets: 3,
        duration: 30,
        rest_time: 15,
        target_muscle: 'cardio',
        instructions: ['Stand with feet together and arms at sides.', 'Jump feet out and raise hands above head.', 'Jump back to start posture.'],
        animation_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'
      },
      {
        id: 'ex-2-' + workoutId,
        workout_id: workoutId,
        name: 'Bodyweight Squats',
        sets: 3,
        reps: 15,
        rest_time: 30,
        target_muscle: 'quadriceps',
        instructions: ['Place feet shoulder-width apart.', 'Lower hips down as if sitting on a chair.', 'Drive through heels back to upright.'],
        animation_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100'
      },
      {
        id: 'ex-3-' + workoutId,
        workout_id: workoutId,
        name: 'Plank Hold Hold',
        sets: 3,
        duration: 45,
        rest_time: 30,
        target_muscle: 'core',
        instructions: ['Support weight on forearms and toes.', 'Maintain straight spine line.', 'Engage abdominal muscles.'],
        animation_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100'
      }
    ];

    if (isSupabaseConfigured) {
      await supabase.from('exercises').insert(list);
    } else {
      const all = getFromMockDb<Exercise>('exercises');
      all.push(...list);
      saveToMockDb('exercises', all);
    }
    return list;
  }
};
export default ExerciseService;
