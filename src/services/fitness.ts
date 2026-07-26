// FitSync Fitness Service (Dual Mode: Supabase or Local Mock Fallback)
// Consolidates steps, water, weight, and workout records into daily logs and caches streak statistics

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { StepService } from './step';
import { WaterService } from './water';
import { WorkoutService } from './workout';
import { WeightService } from './weight';
import type { FitnessLog } from '../types';

export interface FitnessStatistics {
  user_id: string;
  avg_steps: number;
  avg_calories: number;
  avg_water: number;
  workout_streak: number;
  longest_streak: number;
  weight_change: number;
}

export const FitnessService = {
  /**
   * Consolidate granular logs into daily summaries for backwards-compatibility with existing UI pages
   */
  async getFitnessLogs(userId: string): Promise<FitnessLog[]> {
    try {
      const stepLogs = await StepService.getStepLogs(userId, 'year');
      const waterLogs = await WaterService.getWaterLogs(userId);
      const workoutLogs = await WorkoutService.getWorkoutHistory(userId);
      const weightLogs = await WeightService.getWeightLogs(userId);

      const dateMap = new Map<string, Partial<FitnessLog>>();

      const getRecord = (dateStr: string) => {
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, {
            id: `log-${userId}-${dateStr}`,
            user_id: userId,
            date: dateStr,
            steps: 0,
            calories: 0,
            water: 0,
            workout_minutes: 0,
            created_at: `${dateStr}T12:00:00.000Z`
          });
        }
        return dateMap.get(dateStr)!;
      };

      // Accumulate steps
      for (const s of stepLogs) {
        const rec = getRecord(s.date);
        rec.steps = (rec.steps || 0) + s.steps;
        rec.calories = (rec.calories || 0) + Number(s.calories_burned);
      }

      // Accumulate water
      for (const w of waterLogs) {
        const rec = getRecord(w.date);
        rec.water = (rec.water || 0) + w.amount_ml;
      }

      // Accumulate workouts
      for (const wk of workoutLogs) {
        const rec = getRecord(wk.date);
        rec.workout_minutes = (rec.workout_minutes || 0) + wk.duration_minutes;
        rec.calories = (rec.calories || 0) + wk.calories_burned;
        rec.workout_name = wk.name;
        rec.category = wk.category as any;
        rec.duration_minutes = wk.duration_minutes;
        rec.calories_burned = wk.calories_burned;
      }

      // Set weight and BMI
      for (const wt of weightLogs) {
        const rec = getRecord(wt.date);
        rec.weight = Number(wt.weight_kg);
        rec.bmi = Number(wt.bmi);
      }

      // Map back legacy fields
      const result = Array.from(dateMap.values()).map(log => ({
        ...log,
        profile_id: log.user_id,
        workout_name: log.workout_minutes && log.workout_minutes > 0 ? (log.workout_name || 'Cardio Workout') : undefined,
        category: log.category || 'strength',
        duration_minutes: log.workout_minutes,
        calories_burned: log.calories
      })) as FitnessLog[];

      return result.sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
      console.error('Error consolidating daily fitness logs:', err);
      return [];
    }
  },

  /**
   * Fetch today's aggregated log
   */
  async getTodayLog(userId: string): Promise<FitnessLog> {
    const todayStr = new Date().toISOString().split('T')[0];
    const logs = await this.getFitnessLogs(userId);
    const todayLog = logs.find(l => l.date === todayStr);

    if (todayLog) return todayLog;

    // Return an empty today template
    return {
      id: `log-${userId}-${todayStr}`,
      user_id: userId,
      date: todayStr,
      steps: 0,
      calories: 0,
      water: 0,
      workout_minutes: 0,
      created_at: `${todayStr}T12:00:00.000Z`,
      profile_id: userId
    };
  },

  /**
   * Log Steps (routes under StepService but provides compatibility bridge)
   */
  async logSteps(userId: string, steps: number, caloriesBurned: number): Promise<FitnessLog> {
    await StepService.logSteps(userId, steps, caloriesBurned);
    await this.recalculateFitnessStatistics(userId);
    return this.getTodayLog(userId);
  },

  /**
   * Log Water (routes under WaterService)
   */
  async logWater(userId: string, amountMl: number): Promise<FitnessLog> {
    await WaterService.logWater(userId, amountMl);
    await this.recalculateFitnessStatistics(userId);
    return this.getTodayLog(userId);
  },

  /**
   * Log Weight & BMI (routes under WeightService)
   */
  async logWeight(userId: string, weightKg: number, bmi: number, dateStr?: string): Promise<FitnessLog> {
    await WeightService.logWeight(userId, weightKg, bmi, dateStr);
    await this.recalculateFitnessStatistics(userId);
    return this.getTodayLog(userId);
  },

  /**
   * Log Workout (routes under WorkoutService)
   */
  async logWorkout(userId: string, title: string, category: string, duration: number, calories: number): Promise<FitnessLog> {
    await WorkoutService.logWorkout(userId, {
      name: title,
      category,
      duration_minutes: duration,
      calories_burned: calories,
      intensity: 'medium'
    });
    
    // Add activity feed item
    try {
      if (isSupabaseConfigured) {
        await supabase.from('activity_feed').insert({
          profile_id: userId,
          type: 'workout_completed',
          content: `completed a ${duration} min ${category} workout (${title})`
        });
      } else {
        const feed = getFromMockDb<any>('activity_feed');
        feed.unshift({
          id: 'act-' + Math.random().toString(36).substr(2, 9),
          profile_id: userId,
          type: 'workout_completed',
          content: `completed a ${duration} min ${category} workout (${title})`,
          created_at: new Date().toISOString()
        });
        saveToMockDb('activity_feed', feed);
      }
    } catch {}

    await this.recalculateFitnessStatistics(userId);
    return this.getTodayLog(userId);
  },

  /**
   * Recalculate Averages, streaks and weights changes
   */
  async recalculateFitnessStatistics(userId: string): Promise<FitnessStatistics> {
    const logs = await this.getFitnessLogs(userId);
    
    // 1. Calculate Averages
    let avgSteps = 0;
    let avgCalories = 0;
    let avgWater = 0;

    if (logs.length > 0) {
      const sumSteps = logs.reduce((sum, l) => sum + (l.steps || 0), 0);
      const sumCals = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
      const sumWater = logs.reduce((sum, l) => sum + (l.water || 0), 0);

      avgSteps = Math.round(sumSteps / logs.length);
      avgCalories = Math.round(sumCals / logs.length);
      avgWater = Math.round(sumWater / logs.length);
    }

    // 2. Streaks Calculations
    // Consecutive active days (steps > 0 or workouts > 0)
    let currentStreak = 0;
    let longestStreak = 0;

    if (logs.length > 0) {
      // Filter out days that are active
      const activeDates = new Set(
        logs
          .filter(l => l.steps > 0 || l.workout_minutes > 0)
          .map(l => l.date)
      );

      const sortedDates = Array.from(activeDates).sort();
      
      if (sortedDates.length > 0) {
        // Calculate longest streak
        let tempStreak = 0;
        let prevDate: Date | null = null;

        for (const dateStr of sortedDates) {
          const currentDate = new Date(dateStr);
          if (!prevDate) {
            tempStreak = 1;
          } else {
            const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else if (diffDays > 1) {
              if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
              }
              tempStreak = 1;
            }
          }
          prevDate = currentDate;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }

        // Calculate current streak
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        if (activeDates.has(todayStr) || activeDates.has(yesterdayStr)) {
          let checkDate = activeDates.has(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);
          while (activeDates.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++;
            checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
          }
        }
      }
    }

    // 3. Weight change Trend
    const weightLogs = await WeightService.getWeightLogs(userId);
    let weightChange = 0.00;
    if (weightLogs.length >= 2) {
      const currentWeight = Number(weightLogs[0].weight_kg);
      const initialWeight = Number(weightLogs[weightLogs.length - 1].weight_kg);
      weightChange = Number((currentWeight - initialWeight).toFixed(2));
    }

    const stats: FitnessStatistics = {
      user_id: userId,
      avg_steps: avgSteps,
      avg_calories: avgCalories,
      avg_water: avgWater,
      workout_streak: currentStreak,
      longest_streak: longestStreak,
      weight_change: weightChange
    };

    // Upsert into Supabase or LocalStorage
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('fitness_statistics')
        .upsert(stats, { onConflict: 'user_id' });
      if (error) console.error('Failed to cache fitness statistics:', error);
    } else {
      const statsList = getFromMockDb<FitnessStatistics>('fitness_statistics');
      const idx = statsList.findIndex(s => s.user_id === userId);
      if (idx !== -1) {
        statsList[idx] = stats;
      } else {
        statsList.push(stats);
      }
      saveToMockDb('fitness_statistics', statsList);
    }

    return stats;
  },

  /**
   * Fetch fitness statistics
   */
  async getFitnessStatistics(userId: string): Promise<FitnessStatistics> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('fitness_statistics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as unknown as FitnessStatistics;
      return this.recalculateFitnessStatistics(userId);
    } else {
      const statsList = getFromMockDb<FitnessStatistics>('fitness_statistics');
      const rec = statsList.find(s => s.user_id === userId);
      if (rec) return rec;
      return this.recalculateFitnessStatistics(userId);
    }
  }
};
