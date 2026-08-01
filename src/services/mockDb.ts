// FitSync High-Fidelity LocalStorage Database Simulator
// Mimics a backend database with pre-populated records for social features

import type { 
  UserProfile, PrivacySettings, OnlineStatus, Workout, 
  FitnessLog, Challenge, ChallengeMember, 
  LeaderboardEntry, ActivityItem 
} from '../types';

// Pre-populated default workout templates
const DEFAULT_WORKOUTS: Workout[] = [
  {
    id: 'w-1',
    title: 'HIIT Cardio Blast',
    description: 'High intensity interval training focusing on explosive aerobic exercises and fat burning.',
    category: 'hiit',
    duration: 25,
    calories: 320,
    difficulty: 'intermediate'
  },
  {
    id: 'w-2',
    title: 'Full Body Gym Session',
    description: 'Traditional resistance training using weights and machines targeting major muscle groups.',
    category: 'gym',
    duration: 60,
    calories: 450,
    difficulty: 'intermediate'
  },
  {
    id: 'w-3',
    title: 'Vinyasa Power Yoga',
    description: 'Flowing yoga postures linked with breath control to improve flexibility, balance, and core strength.',
    category: 'yoga',
    duration: 40,
    calories: 180,
    difficulty: 'beginner'
  },
  {
    id: 'w-4',
    title: 'Outdoor Trail Run',
    description: 'Scenic outdoor jogging to improve cardiovascular endurance and mental clarity.',
    category: 'cardio',
    duration: 45,
    calories: 420,
    difficulty: 'intermediate'
  },
  {
    id: 'w-5',
    title: 'Bodyweight Strength Circuit',
    description: 'Push-ups, squats, lunges, and planks. No equipment required.',
    category: 'strength',
    duration: 30,
    calories: 220,
    difficulty: 'beginner'
  },
  {
    id: 'w-6',
    title: 'Advanced Olympic Powerlifting',
    description: 'Heavy compound lifts (squat, bench press, deadlift) focusing on maximum strength and power.',
    category: 'strength',
    duration: 75,
    calories: 550,
    difficulty: 'advanced'
  }
];

// Pre-populated platform user profiles (our bot friends)
const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-alex',
    user_id: 'user-alex',
    username: 'alex_rivera',
    fitsync_id: 'FS-ALEX9923',
    full_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    age: 26,
    gender: 'Male',
    height: 182,
    weight: 79.5,
    fitness_goal: 'Build Muscle & Endurance',
    bio: 'Marathon runner and hybrid athlete. Push your limits!',
    location: 'Boston, MA',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-sarah',
    user_id: 'user-sarah',
    username: 'sarah_chen',
    fitsync_id: 'FS-SARA8847',
    full_name: 'Sarah Chen',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    age: 24,
    gender: 'Female',
    height: 165,
    weight: 58.2,
    fitness_goal: 'Maintain Tone & Cardio health',
    bio: 'Yoga instructor and nutrition lover. Balance is key.',
    location: 'San Francisco, CA',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-coach',
    user_id: 'user-coach',
    username: 'coach_david',
    fitsync_id: 'FS-COACH101',
    full_name: 'David Miller',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: 32,
    gender: 'Male',
    height: 188,
    weight: 92.0,
    fitness_goal: 'Strength Coach',
    bio: 'Professional trainer. Here to help you reach your goals.',
    location: 'Austin, TX',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to date strings
const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Safe global localStorage checker and fallback object
const memoryDb: Record<string, string> = {};
const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : {
  getItem: (key: string) => memoryDb[key] || null,
  setItem: (key: string, value: string) => { memoryDb[key] = value; },
  removeItem: (key: string) => { delete memoryDb[key]; },
  clear: () => { Object.keys(memoryDb).forEach(k => delete memoryDb[k]); }
};
const localStorage = storage;

// Setup initial state helper
export const initMockDatabase = () => {
  if (!storage.getItem('fs_initialized')) {
    localStorage.setItem('fs_workouts', JSON.stringify(DEFAULT_WORKOUTS));
    localStorage.setItem('fs_profiles', JSON.stringify(DEFAULT_PROFILES));
    
    // Privacy and online status for default profiles
    const privacySettings: PrivacySettings[] = DEFAULT_PROFILES.map(p => ({
      profile_id: p.id,
      profile_visibility: 'public',
      share_fitness: true,
      hide_weight: false,
      hide_bmi: false,
      hide_online_status: false,
      updated_at: new Date().toISOString()
    }));
    localStorage.setItem('fs_privacy_settings', JSON.stringify(privacySettings));

    const onlineStatus: OnlineStatus[] = DEFAULT_PROFILES.map((p, idx) => ({
      profile_id: p.id,
      is_online: idx < 2, // Alex and Sarah are online
      last_seen: new Date().toISOString()
    }));
    localStorage.setItem('fs_online_status', JSON.stringify(onlineStatus));

    // Prepopulate fitness data for mock users
    const fitnessLogs: FitnessLog[] = [];

    DEFAULT_PROFILES.forEach(p => {
      // Create 7 days of daily logs
      for (let i = 0; i < 7; i++) {
        const date = getPastDateStr(i);
        const randSeed = Math.random();
        
        fitnessLogs.push({
          id: `fit-${p.id}-${i}`,
          user_id: p.id,
          profile_id: p.id,
          date,
          steps: Math.floor(randSeed * 7000) + 6000,
          calories: Math.floor(randSeed * 300) + 250,
          water: (Math.floor(randSeed * 6) + 3) * 250,
          workout_minutes: i % 2 === 0 ? 30 : 0,
          weight: p.weight,
          bmi: 22.5,
          created_at: new Date(date).toISOString(),
          // Legacy Compatibility
          workout_name: i % 2 === 0 ? 'Cardio Shred Session' : undefined,
          category: 'cardio',
          duration_minutes: i % 2 === 0 ? 30 : 0,
          calories_burned: Math.floor(randSeed * 300) + 250
        });
      }
    });

    localStorage.setItem('fs_fitness_logs', JSON.stringify(fitnessLogs));
    localStorage.setItem('fs_friends', JSON.stringify([]));
    localStorage.setItem('fs_friend_requests', JSON.stringify([]));

    // Challenges
    const challenges: Challenge[] = [
      {
        id: 'c-1',
        title: 'Weekly 70K Step Challenge',
        description: 'Aim for 10,000 steps a day this week. Let\'s keep active!',
        start_date: getPastDateStr(3),
        end_date: getPastDateStr(-4),
        goal: 70000,
        created_by: 'user-coach',
        created_at: getPastDateStr(4),
        // Legacy
        creator_id: 'user-coach',
        type: 'steps',
        target: 70000,
        is_private: false
      },
      {
        id: 'c-2',
        title: 'Hydration Challenge',
        description: 'Drink 2.5 Liters (2500ml) of water daily for 5 days.',
        start_date: getPastDateStr(1),
        end_date: getPastDateStr(-4),
        goal: 12500,
        created_by: 'user-sarah',
        created_at: getPastDateStr(2),
        // Legacy
        creator_id: 'user-sarah',
        type: 'water',
        target: 12500,
        is_private: false
      }
    ];
    localStorage.setItem('fs_challenges', JSON.stringify(challenges));

    // Challenge Members
    const challengeMembers: ChallengeMember[] = [
      { id: 'cm-1', challenge_id: 'c-1', user_id: 'user-alex', profile_id: 'user-alex', progress: 34200 },
      { id: 'cm-2', challenge_id: 'c-1', user_id: 'user-sarah', profile_id: 'user-sarah', progress: 31000 },
      { id: 'cm-3', challenge_id: 'c-1', user_id: 'user-coach', profile_id: 'user-coach', progress: 28500 },
      { id: 'cm-4', challenge_id: 'c-2', user_id: 'user-sarah', profile_id: 'user-sarah', progress: 5000 },
      { id: 'cm-5', challenge_id: 'c-2', user_id: 'user-alex', profile_id: 'user-alex', progress: 4500 }
    ];
    localStorage.setItem('fs_challenge_members', JSON.stringify(challengeMembers));

    // Leaderboards entries (calculated cache)
    const leaderboard: LeaderboardEntry[] = [
      // Weekly rankings
      { id: 'l-1', user_id: 'user-alex', profile_id: 'user-alex', score: 58200, steps_total: 58200, calories_total: 2600, period: 'weekly', created_at: new Date().toISOString() },
      { id: 'l-2', user_id: 'user-sarah', profile_id: 'user-sarah', score: 51000, steps_total: 51000, calories_total: 2150, period: 'weekly', created_at: new Date().toISOString() },
      { id: 'l-3', user_id: 'user-coach', profile_id: 'user-coach', score: 44300, steps_total: 44300, calories_total: 2900, period: 'weekly', created_at: new Date().toISOString() },
      // Daily rankings
      { id: 'l-4', user_id: 'user-alex', profile_id: 'user-alex', score: 9200, steps_total: 9200, calories_total: 450, period: 'daily', created_at: new Date().toISOString() },
      { id: 'l-5', user_id: 'user-sarah', profile_id: 'user-sarah', score: 8100, steps_total: 8100, calories_total: 310, period: 'daily', created_at: new Date().toISOString() },
      { id: 'l-6', user_id: 'user-coach', profile_id: 'user-coach', score: 7500, steps_total: 7500, calories_total: 520, period: 'daily', created_at: new Date().toISOString() },
      // Monthly rankings
      { id: 'l-7', user_id: 'user-alex', profile_id: 'user-alex', score: 242000, steps_total: 242000, calories_total: 11200, period: 'monthly', created_at: new Date().toISOString() },
      { id: 'l-8', user_id: 'user-sarah', profile_id: 'user-sarah', score: 218000, steps_total: 218000, calories_total: 9100, period: 'monthly', created_at: new Date().toISOString() },
      { id: 'l-9', user_id: 'user-coach', profile_id: 'user-coach', score: 198000, steps_total: 198000, calories_total: 12500, period: 'monthly', created_at: new Date().toISOString() }
    ];
    localStorage.setItem('fs_leaderboards', JSON.stringify(leaderboard));

    // Activity feed
    const activities: ActivityItem[] = [
      {
        id: 'act-1',
        profile_id: 'user-sarah',
        type: 'workout_completed',
        content: 'completed an Outdoor Trail Run workout',
        data: { duration: 45, calories: 420 },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-2',
        profile_id: 'user-alex',
        type: 'challenge_joined',
        content: 'joined the "Weekly 70K Step Challenge"',
        data: { challenge_title: 'Weekly 70K Step Challenge' },
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-3',
        profile_id: 'user-coach',
        type: 'achievement_earned',
        content: 'earned the "Iron Will" achievement for completing 5 workouts in a week!',
        data: { badge: 'fitness_center' },
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('fs_activity_feed', JSON.stringify(activities));
    localStorage.setItem('fs_notifications', JSON.stringify([]));
    localStorage.setItem('fs_initialized', 'true');
  }
};

// Accessor helpers
export const getFromMockDb = <T>(key: string): T[] => {
  initMockDatabase();
  const data = localStorage.getItem(`fs_${key}`);
  return data ? JSON.parse(data) : [];
};

export const saveToMockDb = <T>(key: string, data: T[]): void => {
  localStorage.setItem(`fs_${key}`, JSON.stringify(data));
};
