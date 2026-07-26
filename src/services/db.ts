// FitSync Unified Database Service Façade
// Acts as a backward-compatible wrapper routing requests to the new specialized service singletons

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { WorkoutService } from './workout';
import { FitnessService } from './fitness';
import { FriendService } from './friend';
import { NotificationService } from './notification';
import { LeaderboardService } from './leaderboard';
import { ChallengeService } from './challenge';
import type { 
  Workout, FitnessLog, StepLog, WaterLog, WeightLog, 
  Friend, FriendRequest, Challenge, ChallengeMember, 
  Notification, LeaderboardEntry, ActivityItem, PrivacySettings 
} from '../types';

export const dbService = {
  // 1. WORKOUT LIBRARY
  async getWorkouts(): Promise<Workout[]> {
    const data = await WorkoutService.getWorkouts();
    // Map to include legacy default_duration/default_calories fields
    return data.map(w => ({
      ...w,
      default_duration: w.duration,
      default_calories: w.calories
    }));
  },

  // 2. FITNESS LOGS
  async getFitnessLogs(profileId: string): Promise<FitnessLog[]> {
    return FitnessService.getFitnessLogs(profileId);
  },

  async getTodayLog(profileId: string): Promise<FitnessLog> {
    return FitnessService.getTodayLog(profileId);
  },

  // 3. STEP LOGS (Legacy compat maps to FitnessLogs)
  async getStepLogs(profileId: string): Promise<StepLog[]> {
    const logs = await FitnessService.getFitnessLogs(profileId);
    return logs.map(l => ({
      id: `step-${l.id}`,
      profile_id: l.user_id,
      steps: l.steps,
      calories_burned: l.calories,
      date: l.date,
      created_at: l.created_at
    }));
  },

  async logSteps(profileId: string, steps: number, caloriesBurned: number, _date?: string): Promise<FitnessLog> {
    return FitnessService.logSteps(profileId, steps, caloriesBurned);
  },

  // 4. WATER LOGS (Legacy compat maps to FitnessLogs)
  async getWaterLogs(profileId: string): Promise<WaterLog[]> {
    const logs = await FitnessService.getFitnessLogs(profileId);
    return logs.map(l => ({
      id: `water-${l.id}`,
      profile_id: l.user_id,
      amount_ml: l.water,
      date: l.date,
      created_at: l.created_at
    }));
  },

  async logWater(profileId: string, amountMl: number, _date?: string): Promise<FitnessLog> {
    return FitnessService.logWater(profileId, amountMl);
  },

  // 5. WEIGHT LOGS (Legacy compat maps to FitnessLogs)
  async getWeightLogs(profileId: string): Promise<WeightLog[]> {
    const logs = await FitnessService.getFitnessLogs(profileId);
    return logs
      .filter(l => l.weight !== undefined && l.weight !== null)
      .map(l => ({
        id: `weight-${l.id}`,
        profile_id: l.user_id,
        weight_kg: l.weight!,
        bmi: l.bmi || 22.0,
        date: l.date,
        created_at: l.created_at
      }));
  },

  async logWeight(profileId: string, weightKg: number, bmi: number, _date?: string): Promise<FitnessLog> {
    return FitnessService.logWeight(profileId, weightKg, bmi);
  },

  // 6. WORKOUT ENTRIES
  async logWorkout(log: { profile_id: string; workout_id?: string; workout_name: string; category: string; duration_minutes: number; calories_burned: number; notes?: string }): Promise<FitnessLog> {
    return FitnessService.logWorkout(log.profile_id, log.workout_name, log.category, log.duration_minutes, log.calories_burned);
  },

  // 7. SOCIAL CONNECTIONS
  async getFriends(profileId: string): Promise<Friend[]> {
    return FriendService.getFriends(profileId);
  },

  async getFriendRequests(profileId: string): Promise<FriendRequest[]> {
    return FriendService.getFriendRequests(profileId);
  },

  async sendFriendRequest(senderId: string, receiverUsername: string): Promise<{ success: boolean; message: string }> {
    try {
      await FriendService.sendFriendRequest(senderId, receiverUsername);
      return { success: true, message: 'Friend request sent successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error sending request.' };
    }
  },

  async handleFriendRequest(requestId: string, status: 'accepted' | 'rejected', currentUserId: string): Promise<void> {
    return FriendService.handleFriendRequest(requestId, status, currentUserId);
  },

  async removeFriend(userId: string, friendId: string): Promise<void> {
    return FriendService.removeFriend(userId, friendId);
  },

  // 8. NOTIFICATIONS
  async getNotifications(profileId: string): Promise<Notification[]> {
    return NotificationService.getNotifications(profileId);
  },

  async markNotificationAsRead(id: string): Promise<void> {
    return NotificationService.markAsRead(id);
  },

  // 9. LEADERBOARDS
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> {
    return LeaderboardService.getLeaderboard(period);
  },

  async updateScore(userId: string, score: number, period: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    return LeaderboardService.updateScore(userId, score, period);
  },

  // 10. CHALLENGES
  async getChallenges(): Promise<Challenge[]> {
    return ChallengeService.getChallenges();
  },

  async getChallengeMembers(challengeId: string): Promise<ChallengeMember[]> {
    return ChallengeService.getChallengeMembers(challengeId);
  },

  async createChallenge(challenge: any, creatorId?: string): Promise<Challenge> {
    const cid = creatorId || challenge.creator_id || challenge.created_by;
    return ChallengeService.createChallenge(challenge, cid);
  },

  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    return ChallengeService.joinChallenge(challengeId, userId);
  },

  async updateChallengeProgress(challengeId: string, userId: string, progress: number): Promise<void> {
    return ChallengeService.updateChallengeProgress(challengeId, userId, progress);
  },

  // 11. PRIVACY SETTINGS
  async getPrivacySettings(profileId: string): Promise<PrivacySettings> {
    const settings = getFromMockDb<PrivacySettings>('privacy_settings');
    const record = settings.find(s => s.profile_id === profileId);
    if (record) return record;
    return {
      profile_id: profileId,
      profile_visibility: 'public',
      share_fitness: true,
      hide_weight: false,
      hide_bmi: false,
      hide_online_status: false,
      updated_at: new Date().toISOString()
    };
  },

  async updatePrivacySettings(details: PrivacySettings): Promise<PrivacySettings> {
    const settings = getFromMockDb<PrivacySettings>('privacy_settings');
    const idx = settings.findIndex(s => s.profile_id === details.profile_id);
    const updated = {
      ...details,
      updated_at: new Date().toISOString()
    };
    if (idx !== -1) {
      settings[idx] = updated;
    } else {
      settings.push(updated);
    }
    saveToMockDb('privacy_settings', settings);
    return updated;
  },

  // 12. SOCIAL ACTIVITY FEED (Legacy feed retrieval)
  async getActivityFeed(_profileId: string): Promise<ActivityItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*, profile:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data as unknown as ActivityItem[]) || [];
    } else {
      const feed = getFromMockDb<ActivityItem>('activity_feed');
      const profiles = getFromMockDb<any>('profiles');
      return feed.map(item => ({
        ...item,
        profile: profiles.find((p: any) => p.id === item.profile_id)
      }));
    }
  }
};
