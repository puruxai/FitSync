// FitSync Profile Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles profile CRUD, username checks, privacy toggles, settings, and stats recalculations

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import type { UserProfile, PrivacySettings } from '../types';
import { profileBiometricsSchema } from '../utils/validation';
import { PrivacyService } from './privacy';

export interface ProfileStats {
  user_id: string;
  current_weight: number;
  current_bmi: number;
  avg_daily_steps: number;
  avg_calories: number;
  workout_streak: number;
  total_workouts: number;
  friends_count: number;
  challenges_completed: number;
}

export interface ProfileSettings {
  user_id: string;
  theme: 'light' | 'dark';
  email_notifications: boolean;
  push_notifications: boolean;
}

export const ProfileService = {
  // 1. Fetch user profile
  async getProfile(id: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as UserProfile;
    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      const profile = profiles.find(p => p.id === id);
      if (!profile) throw new Error('Profile not found.');
      return profile;
    }
  },

  // 2. Update profile biometrics & details
  async updateProfile(id: string, details: Partial<UserProfile>): Promise<UserProfile> {
    // Validate inputs using Zod
    try {
      profileBiometricsSchema.parse(details);
    } catch (validationError: any) {
      throw new Error(validationError.errors?.[0]?.message || 'Validation error.');
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...details,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update statistics as well since weight/height might have changed
      await this.recalculateProfileStats(id);
      
      return data as unknown as UserProfile;
    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      const idx = profiles.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Profile not found.');

      const updated = {
        ...profiles[idx],
        ...details,
        updated_at: new Date().toISOString()
      };
      profiles[idx] = updated;
      saveToMockDb('profiles', profiles);

      // Sync active session cached profile if applicable
      const sessionData = localStorage.getItem('fs_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.profile?.id === id) {
          session.profile = updated;
          localStorage.setItem('fs_session', JSON.stringify(session));
        }
      }

      // Update statistics locally
      await this.recalculateProfileStats(id);

      return updated;
    }
  },

  // 3. Search users (by Username or FitSync ID)
  async searchProfiles(query: string): Promise<UserProfile[]> {
    const target = query.trim().toLowerCase();
    if (!target) return [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${target}%,fitsync_id.ilike.%${target}%`);

      if (error) throw error;
      return (data as unknown as UserProfile[]) || [];
    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      return profiles.filter(
        p => p.username.toLowerCase().includes(target) || 
             p.fitsync_id.toLowerCase().includes(target) ||
             p.full_name.toLowerCase().includes(target)
      );
    }
  },

  // 4. Validate username availability
  async checkUsernameAvailability(username: string, currentUserId: string): Promise<boolean> {
    const lowerUsername = username.trim().toLowerCase();
    if (!lowerUsername) return false;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', lowerUsername)
        .neq('id', currentUserId);

      if (error) throw error;
      return data.length === 0;
    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      return !profiles.some(p => p.username.toLowerCase() === lowerUsername && p.id !== currentUserId);
    }
  },

  // 5. Profile Privacy (profile_visibility, biometrics locks)
  async getProfilePrivacy(userId: string): Promise<PrivacySettings> {
    const data = await PrivacyService.getPrivacy(userId);
    return data;
  },

  async updateProfilePrivacy(userId: string, updates: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const data = await PrivacyService.updatePrivacy(userId, updates);
    return data;
  },

  // 6. User Settings (theme, notification configs)
  async getProfileSettings(userId: string): Promise<ProfileSettings> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profile_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        const newSettings = {
          user_id: userId,
          theme: 'dark' as const,
          email_notifications: true,
          push_notifications: true
        };
        const { data: inserted, error: insertError } = await supabase
          .from('profile_settings')
          .insert(newSettings)
          .select()
          .single();
        if (insertError) throw insertError;
        return inserted as unknown as ProfileSettings;
      }
      return data as unknown as ProfileSettings;
    } else {
      const settingsList = getFromMockDb<ProfileSettings>('profile_settings');
      let rec = settingsList.find(p => p.user_id === userId);
      if (!rec) {
        rec = {
          user_id: userId,
          theme: 'dark',
          email_notifications: true,
          push_notifications: true
        };
        settingsList.push(rec);
        saveToMockDb('profile_settings', settingsList);
      }
      return rec;
    }
  },

  async updateProfileSettings(userId: string, updates: Partial<ProfileSettings>): Promise<ProfileSettings> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profile_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ProfileSettings;
    } else {
      const settingsList = getFromMockDb<ProfileSettings>('profile_settings');
      const idx = settingsList.findIndex(p => p.user_id === userId);
      let updated: ProfileSettings;
      if (idx !== -1) {
        updated = { ...settingsList[idx], ...updates };
        settingsList[idx] = updated;
      } else {
        updated = {
          user_id: userId,
          theme: updates.theme || 'dark',
          email_notifications: updates.email_notifications ?? true,
          push_notifications: updates.push_notifications ?? true
        };
        settingsList.push(updated);
      }
      saveToMockDb('profile_settings', settingsList);
      return updated;
    }
  },

  // 7. Recalculate Statistics
  async recalculateProfileStats(userId: string): Promise<ProfileStats> {
    // 1. Fetch user fitness logs
    let logs: any[] = [];
    let friendsCount = 0;
    let challengesCount = 0;
    let weight = 70.0;
    let height = 175.0;

    if (isSupabaseConfigured) {
      // Get height/weight from profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('weight, height')
        .eq('id', userId)
        .single();
      
      if (prof) {
        weight = Number(prof.weight || 70);
        height = Number(prof.height || 175);
      }

      // Get fitness logs
      const { data: fLogs } = await supabase
        .from('fitness_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      logs = fLogs || [];

      // Get friends count
      const { count } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .or(`user1.eq.${userId},user2.eq.${userId}`);
      friendsCount = count || 0;

      // Get completed challenges count
      const { data: mems } = await supabase
        .from('challenge_members')
        .select('*, challenge:challenges(*)')
        .eq('user_id', userId);

      const today = new Date().toISOString().split('T')[0];
      challengesCount = mems?.filter((m: any) => {
        const ch = m.challenge;
        if (!ch) return false;
        const isEnded = ch.end_date < today;
        const goalMet = m.progress >= ch.goal;
        return isEnded && goalMet;
      }).length || 0;

    } else {
      const profiles = getFromMockDb<UserProfile>('profiles');
      const prof = profiles.find(p => p.id === userId);
      if (prof) {
        weight = Number(prof.weight || 70);
        height = Number(prof.height || 175);
      }

      const allLogs = getFromMockDb<any>('fitness_logs');
      logs = allLogs
        .filter((l: any) => l.user_id === userId)
        .sort((a: any, b: any) => b.date.localeCompare(a.date));

      const friends = getFromMockDb<any>('friends');
      friendsCount = friends.filter((f: any) => f.user1 === userId || f.user2 === userId).length;

      const mems = getFromMockDb<any>('challenge_members');
      const challenges = getFromMockDb<any>('challenges');
      const today = new Date().toISOString().split('T')[0];
      
      challengesCount = mems.filter((m: any) => {
        if (m.user_id !== userId) return false;
        const ch = challenges.find((c: any) => c.id === m.challenge_id);
        if (!ch) return false;
        const isEnded = ch.end_date < today;
        const goalMet = m.progress >= ch.goal;
        return isEnded && goalMet;
      }).length;
    }

    // Calculations
    const heightInMeters = height / 100;
    const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(2)) || 22.0;

    const totalWorkouts = logs.filter(l => l.workout_minutes > 0).length;
    
    let avgSteps = 0;
    let avgCalories = 0;
    if (logs.length > 0) {
      const sumSteps = logs.reduce((sum, l) => sum + (l.steps || 0), 0);
      const sumCals = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
      avgSteps = Math.round(sumSteps / logs.length);
      avgCalories = Math.round(sumCals / logs.length);
    }

    // Workout Streak (consecutive days of steps > 0 or workouts > 0)
    let streak = 0;
    if (logs.length > 0) {
      const uniqueDays = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
      
      let expectedDate = new Date();
      // If the latest log is not today or yesterday, streak is broken
      const latestLogDate = new Date(uniqueDays[0]);
      const diffTime = Math.abs(expectedDate.getTime() - latestLogDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) {
        for (const dateStr of uniqueDays) {
          const log = logs.find(l => l.date === dateStr);
          if (log && (log.steps > 0 || log.workout_minutes > 0)) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    const stats: ProfileStats = {
      user_id: userId,
      current_weight: weight,
      current_bmi: bmi,
      avg_daily_steps: avgSteps,
      avg_calories: avgCalories,
      workout_streak: streak,
      total_workouts: totalWorkouts,
      friends_count: friendsCount,
      challenges_completed: challengesCount
    };

    // Upsert into profile_statistics
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profile_statistics')
        .upsert(stats, { onConflict: 'user_id' });
      if (error) console.error('Failed to save profile stats to Supabase:', error);
    } else {
      const statsList = getFromMockDb<ProfileStats>('profile_statistics');
      const idx = statsList.findIndex(s => s.user_id === userId);
      if (idx !== -1) {
        statsList[idx] = stats;
      } else {
        statsList.push(stats);
      }
      saveToMockDb('profile_statistics', statsList);
    }

    return stats;
  },

  async getProfileStats(userId: string): Promise<ProfileStats> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profile_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Fallback: Recalculate & return
        return this.recalculateProfileStats(userId);
      }
      return data as unknown as ProfileStats;
    } else {
      const statsList = getFromMockDb<ProfileStats>('profile_statistics');
      const rec = statsList.find(s => s.user_id === userId);
      if (!rec) {
        return this.recalculateProfileStats(userId);
      }
      return rec;
    }
  }
};
