// FitSync Challenge Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles creation, listing, duplication, deletion, and social invites for challenges

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  banner_url?: string;
  category: 'steps' | 'calories' | 'workout_minutes' | 'water' | 'weight_loss' | 'running_distance' | 'cycling' | 'yoga' | 'strength_training' | 'hiit' | 'custom';
  goal_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  visibility: 'public' | 'friends' | 'private';
  max_participants: number;
  min_participants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reward_points: number;
  created_at: string;
  
  // Custom Join UI fields
  members_count?: number;
  creator_profile?: any;
  // Legacy backward compatibility fields
  goal?: number;
  target?: number;
  type?: string;
  created_by?: string;
}

export interface ChallengeMember {
  id: string;
  challenge_id: string;
  user_id: string;
  status: 'joined' | 'waiting_list';
  joined_at: string;
  profile?: any;
  
  // Legacy compatibility fields
  profile_id?: string;
  progress?: number;
}

export const ChallengeService = {
  /**
   * Fetch all visible challenges
   */
  async getChallenges(): Promise<Challenge[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, creator_profile:profiles!challenges_creator_id_fkey(*)');

      if (error) throw error;
      const list = (data as any[]) || [];

      for (const ch of list) {
        const { count } = await supabase
          .from('challenge_members')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', ch.id);
        ch.members_count = count || 0;
        
        // Populate legacy fields
        ch.goal = ch.goal_value;
        ch.target = ch.goal_value;
        ch.type = ch.category;
        ch.created_by = ch.creator_id;
      }
      return list as unknown as Challenge[];
    } else {
      const challenges = getFromMockDb<Challenge>('challenges');
      const profiles = getFromMockDb<any>('profiles');
      const members = getFromMockDb<ChallengeMember>('challenge_members');

      // Default mock seeding if empty
      if (challenges.length === 0) {
        this.seedMockChallenges(profiles[0]?.id || 'user-alex');
      }

      return getFromMockDb<Challenge>('challenges').map(ch => {
        const count = members.filter(m => m.challenge_id === ch.id).length;
        const creatorId = ch.creator_id || 'user-alex';
        return {
          ...ch,
          creator_id: creatorId,
          created_by: creatorId,
          goal: ch.goal_value,
          target: ch.goal_value,
          type: ch.category,
          members_count: count,
          creator_profile: profiles.find((p: any) => p.id === creatorId)
        };
      });
    }
  },

  /**
   * Fetch participants of a specific challenge
   */
  async getChallengeMembers(challengeId: string): Promise<ChallengeMember[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('challenge_members')
        .select('*, profile:profiles(*)')
        .eq('challenge_id', challengeId);

      if (error) throw error;
      return ((data as unknown as ChallengeMember[]) || []).map(m => ({
        ...m,
        profile_id: m.user_id
      }));
    } else {
      const members = getFromMockDb<ChallengeMember>('challenge_members');
      const profiles = getFromMockDb<any>('profiles');

      return members
        .filter(m => m.challenge_id === challengeId)
        .map(m => ({
          ...m,
          profile_id: m.user_id,
          profile: profiles.find((p: any) => p.id === m.user_id)
        }));
    }
  },

  /**
   * Create a challenge
   */
  async createChallenge(
    challenge: Omit<Challenge, 'id' | 'created_at' | 'members_count' | 'creator_profile' | 'creator_id'>,
    creatorId: string
  ): Promise<Challenge> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          creator_id: creatorId,
          title: challenge.title,
          description: challenge.description || '',
          banner_url: challenge.banner_url || '',
          category: challenge.category,
          goal_value: challenge.goal_value,
          target_unit: challenge.target_unit,
          start_date: challenge.start_date,
          end_date: challenge.end_date,
          visibility: challenge.visibility,
          max_participants: challenge.max_participants,
          min_participants: challenge.min_participants,
          difficulty: challenge.difficulty,
          reward_points: challenge.reward_points
        })
        .select()
        .single();

      if (error) throw error;

      // Creator joins automatically
      await this.joinChallenge(data.id, creatorId);
      return data as unknown as Challenge;
    } else {
      const challenges = getFromMockDb<Challenge>('challenges');
      const newCh: Challenge = {
        ...challenge,
        id: 'ch-' + Math.random().toString(36).substr(2, 9),
        creator_id: creatorId,
        created_by: creatorId,
        created_at: new Date().toISOString()
      };

      challenges.push(newCh);
      saveToMockDb('challenges', challenges);

      // Creator joins
      await this.joinChallenge(newCh.id, creatorId);
      return newCh;
    }
  },

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('challenge_members')
        .upsert({
          challenge_id: challengeId,
          user_id: userId,
          status: 'joined',
          joined_at: new Date().toISOString()
        }, { onConflict: 'challenge_id,user_id' });

      if (error) throw error;
    } else {
      const members = getFromMockDb<ChallengeMember>('challenge_members');
      const exists = members.some(m => m.challenge_id === challengeId && m.user_id === userId);
      if (exists) return;

      members.push({
        id: 'cm-' + Math.random().toString(36).substr(2, 9),
        challenge_id: challengeId,
        user_id: userId,
        profile_id: userId,
        status: 'joined',
        joined_at: new Date().toISOString()
      });
      saveToMockDb('challenge_members', members);
    }
  },

  /**
   * Leave a challenge
   */
  async leaveChallenge(challengeId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('challenge_members')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);
    } else {
      const members = getFromMockDb<ChallengeMember>('challenge_members');
      const filtered = members.filter(m => !(m.challenge_id === challengeId && m.user_id === userId));
      saveToMockDb('challenge_members', filtered);
    }
  },

  /**
   * Delete challenge
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);
    } else {
      const challenges = getFromMockDb<Challenge>('challenges');
      const filtered = challenges.filter(c => c.id !== challengeId);
      saveToMockDb('challenges', filtered);
    }
  },

  /**
   * Duplicate challenge
   */
  async duplicateChallenge(challengeId: string, creatorId: string): Promise<Challenge> {
    const list = await this.getChallenges();
    const orig = list.find(c => c.id === challengeId);
    if (!orig) throw new Error('Challenge not found');

    return this.createChallenge({
      title: `${orig.title} (Clone)`,
      description: orig.description,
      banner_url: orig.banner_url,
      category: orig.category || 'steps',
      goal_value: orig.goal_value || 10000,
      target_unit: orig.target_unit || 'steps',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      visibility: orig.visibility || 'public',
      max_participants: orig.max_participants || 50,
      min_participants: orig.min_participants || 1,
      difficulty: orig.difficulty || 'intermediate',
      reward_points: orig.reward_points || 500
    }, creatorId);
  },

  /**
   * Update challenge progress manually
   */
  async updateChallengeProgress(challengeId: string, userId: string, progress: number): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('challenge_progress')
        .upsert({
          challenge_id: challengeId,
          user_id: userId,
          value: progress,
          updated_at: new Date().toISOString()
        }, { onConflict: 'challenge_id,user_id' });
    } else {
      const list = getFromMockDb<any>('challenge_progress');
      const idx = list.findIndex((p: any) => p.challenge_id === challengeId && p.user_id === userId);
      if (idx !== -1) {
        list[idx].value = progress;
        list[idx].updated_at = new Date().toISOString();
      } else {
        list.push({
          id: 'cpr-' + Math.random().toString(36).substr(2, 9),
          challenge_id: challengeId,
          user_id: userId,
          value: progress,
          updated_at: new Date().toISOString()
        });
      }
      saveToMockDb('challenge_progress', list);
    }
  },

  /**
   * Seed Mock challenges
   */
  seedMockChallenges(creatorId: string) {
    const defaults: Challenge[] = [
      {
        id: 'c-1',
        creator_id: creatorId,
        title: 'Weekly 70K Step Marathon',
        description: 'Complete 70,000 steps this week to prove your walking streak. Compete with close friends!',
        banner_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
        category: 'steps',
        goal_value: 70000,
        target_unit: 'steps',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        visibility: 'public',
        max_participants: 50,
        min_participants: 2,
        difficulty: 'intermediate',
        reward_points: 500,
        created_at: new Date().toISOString()
      },
      {
        id: 'c-2',
        creator_id: creatorId,
        title: 'HIIT Cardio Shredder',
        description: 'Log 180 minutes of intense HIIT active workouts. Ready to sweat?',
        banner_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
        category: 'workout_minutes',
        goal_value: 180,
        target_unit: 'minutes',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        visibility: 'public',
        max_participants: 30,
        min_participants: 1,
        difficulty: 'advanced',
        reward_points: 1000,
        created_at: new Date().toISOString()
      }
    ];

    saveToMockDb('challenges', defaults);
    
    // Auto member seed
    const mems: ChallengeMember[] = [
      { id: 'cm-m-1', challenge_id: 'c-1', user_id: creatorId, status: 'joined', joined_at: new Date().toISOString() },
      { id: 'cm-m-2', challenge_id: 'c-2', user_id: creatorId, status: 'joined', joined_at: new Date().toISOString() }
    ];
    saveToMockDb('challenge_members', mems);
  }
};
