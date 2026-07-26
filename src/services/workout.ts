// FitSync Workout Service (Dual Mode: Supabase or Local Mock Fallback)
// Manages workout catalog search, filters, bookmark favorites, recently viewed lists, and details loading

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface Workout {
  id: string;
  title: string;
  description?: string;
  category: 'home' | 'gym' | 'hiit' | 'yoga' | 'pilates' | 'strength' | 'cardio' | 'running' | 'cycling' | 'stretching' | 'crossfit' | 'calisthenics' | 'bodyweight' | 'senior_fitness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  calories: number; // estimate
  equipment_required: string[];
  muscle_groups: string[];
  target_gender: string;
  target_goal?: string;
  cover_image?: string;
  video_url?: string;
  instructions?: string[];
  safety_tips?: string[];
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  name: string;
  category: string;
  duration_minutes: number;
  calories_burned: number;
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
  date: string;
  created_at: string;
}

export const WorkoutService = {
  /**
   * Fetch all workouts (with client-side or server-side filtering)
   */
  async getWorkouts(): Promise<Workout[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workouts')
        .select('*');

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return this.seedMockWorkouts();
      }
      return data as unknown as Workout[];
    } else {
      const workouts = getFromMockDb<Workout>('workouts');
      if (workouts.length === 0) {
        return this.seedMockWorkouts();
      }
      return workouts;
    }
  },

  /**
   * Get single workout by ID
   */
  async getWorkoutById(id: string): Promise<Workout | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Workout;
    } else {
      const list = await this.getWorkouts();
      return list.find(w => w.id === id) || null;
    }
  },

  /**
   * Favorite / Bookmark Workout
   */
  async toggleFavorite(userId: string, workoutId: string, isFavorite: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      if (isFavorite) {
        await supabase
          .from('favorite_workouts')
          .insert({ user_id: userId, workout_id: workoutId });
      } else {
        await supabase
          .from('favorite_workouts')
          .delete()
          .eq('user_id', userId)
          .eq('workout_id', workoutId);
      }
    } else {
      const favs = getFromMockDb<any>('favorite_workouts');
      if (isFavorite) {
        if (!favs.some((f: any) => f.user_id === userId && f.workout_id === workoutId)) {
          favs.push({
            id: 'fav-' + Math.random().toString(36).substr(2, 9),
            user_id: userId,
            workout_id: workoutId,
            created_at: new Date().toISOString()
          });
        }
      } else {
        const filtered = favs.filter((f: any) => !(f.user_id === userId && f.workout_id === workoutId));
        saveToMockDb('favorite_workouts', filtered);
        return;
      }
      saveToMockDb('favorite_workouts', favs);
    }
  },

  /**
   * Get Favorite Bookmarked Workouts
   */
  async getFavorites(userId: string): Promise<Workout[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('favorite_workouts')
        .select('*, workout:workouts(*)')
        .eq('user_id', userId);
      if (error) throw error;
      return ((data as any[]) || []).map(d => d.workout).filter(Boolean);
    } else {
      const favs = getFromMockDb<any>('favorite_workouts');
      const workouts = await this.getWorkouts();
      return favs
        .filter((f: any) => f.user_id === userId)
        .map((f: any) => workouts.find(w => w.id === f.workout_id))
        .filter(Boolean) as Workout[];
    }
  },

  /**
   * Add to recently viewed workouts
   */
  async addToRecent(userId: string, workoutId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('recent_workouts')
        .insert({ user_id: userId, workout_id: workoutId, viewed_at: new Date().toISOString() });
    } else {
      const recents = getFromMockDb<any>('recent_workouts');
      recents.unshift({
        id: 'rec-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        workout_id: workoutId,
        viewed_at: new Date().toISOString()
      });
      // Keep only last 10
      saveToMockDb('recent_workouts', recents.slice(0, 10));
    }
  },

  /**
   * Get recently viewed workouts list
   */
  async getRecent(userId: string): Promise<Workout[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('recent_workouts')
        .select('*, workout:workouts(*)')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return ((data as any[]) || []).map(d => d.workout).filter(Boolean);
    } else {
      const recents = getFromMockDb<any>('recent_workouts');
      const workouts = await this.getWorkouts();
      return recents
        .filter((r: any) => r.user_id === userId)
        .map((r: any) => workouts.find(w => w.id === r.workout_id))
        .filter(Boolean)
        .slice(0, 6) as Workout[];
    }
  },

  /**
   * Log manual/quick workout history (bridges back compatible logs)
   */
  async logWorkout(
    userId: string,
    details: {
      name: string;
      category: string;
      duration_minutes: number;
      calories_burned: number;
      intensity: 'low' | 'medium' | 'high';
      notes?: string;
      date?: string;
    }
  ): Promise<WorkoutLog> {
    const date = details.date || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: userId,
          name: details.name,
          category: details.category,
          duration_minutes: details.duration_minutes,
          calories_burned: details.calories_burned,
          intensity: details.intensity,
          notes: details.notes || '',
          date
        })
        .select()
        .single();
      if (error) throw error;

      // Sync calorie logs
      await supabase
        .from('calorie_logs')
        .insert({
          user_id: userId,
          calories: details.calories_burned,
          type: 'burned',
          description: `Workout: ${details.name}`,
          date
        });

      return data as unknown as WorkoutLog;
    } else {
      const logs = getFromMockDb<WorkoutLog>('workout_logs');
      const newLog: WorkoutLog = {
        id: 'wlog-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        name: details.name,
        category: details.category,
        duration_minutes: details.duration_minutes,
        calories_burned: details.calories_burned,
        intensity: details.intensity,
        notes: details.notes || '',
        date,
        created_at: new Date().toISOString()
      };
      logs.push(newLog);
      saveToMockDb('workout_logs', logs);

      // Sync to local calorie logs
      const cLogs = getFromMockDb<any>('calorie_logs');
      cLogs.push({
        id: 'cal-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        calories: details.calories_burned,
        type: 'burned',
        description: `Workout: ${details.name}`,
        date,
        created_at: new Date().toISOString()
      });
      saveToMockDb('calorie_logs', cLogs);

      return newLog;
    }
  },

  /**
   * Get manual workout logs history
   */
  async getWorkoutHistory(userId: string): Promise<WorkoutLog[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data as unknown as WorkoutLog[]) || [];
    } else {
      const logs = getFromMockDb<WorkoutLog>('workout_logs');
      return logs
        .filter(l => l.user_id === userId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  /**
   * Delete manual workout log
   */
  async deleteWorkoutLog(logId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('workout_logs')
        .delete()
        .eq('id', logId);
    } else {
      const logs = getFromMockDb<WorkoutLog>('workout_logs');
      const filtered = logs.filter(l => l.id !== logId);
      saveToMockDb('workout_logs', filtered);
    }
  },

  /**
   * Seed mock workouts catalog
   */
  async seedMockWorkouts(): Promise<Workout[]> {
    const list: Workout[] = [
      {
        id: 'w-1',
        title: 'HIIT Cardio Blast',
        description: 'High intensity interval training focusing on rapid fat burning and stamina build-ups.',
        category: 'hiit',
        difficulty: 'intermediate',
        duration: 25,
        calories: 320,
        equipment_required: ['none'],
        muscle_groups: ['quadriceps', 'hamstrings', 'core'],
        target_gender: 'all',
        target_goal: 'fat_loss',
        cover_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
        instructions: ['Perform active cycles for 45s.', 'Rest for 15s between exercises.', 'Repeat for 4 total sets.'],
        safety_tips: ['Keep your back straight during jumps.', 'Stay hydrated.'],
        created_at: new Date().toISOString()
      },
      {
        id: 'w-2',
        title: 'Strength Training Foundation',
        description: 'Core lift cycles targeting squats, deadlifts, and bench press forms.',
        category: 'strength',
        difficulty: 'intermediate',
        duration: 45,
        calories: 250,
        equipment_required: ['dumbbells', 'barbell'],
        muscle_groups: ['chest', 'back', 'legs'],
        target_gender: 'all',
        target_goal: 'muscle_gain',
        cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
        instructions: ['Squats 3x12 reps.', 'Deadlifts 3x8 reps.', 'Bench Press 3x10 reps.'],
        safety_tips: ['Focus on range of motion over weight.', 'Use a spotter for heavy weights.'],
        created_at: new Date().toISOString()
      },
      {
        id: 'w-3',
        title: 'Sun Salutation Yoga Flow',
        description: 'Vinyasa sequence focusing on deep stretching, dynamic mobility, and posture control.',
        category: 'yoga',
        difficulty: 'beginner',
        duration: 30,
        calories: 140,
        equipment_required: ['mat'],
        muscle_groups: ['shoulders', 'lower_back', 'hips'],
        target_gender: 'all',
        target_goal: 'flexibility',
        cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
        instructions: ['Sun salutations cycle A x5.', 'Warrior postures sequence.', 'Child\'s pose deep relaxation.'],
        safety_tips: ['Breathe steadily.', 'Never force a stretch if it feels painful.'],
        created_at: new Date().toISOString()
      }
    ];

    if (isSupabaseConfigured) {
      await supabase.from('workouts').insert(list);
    } else {
      saveToMockDb('workouts', list);
    }
    return list;
  }
};
export default WorkoutService;
