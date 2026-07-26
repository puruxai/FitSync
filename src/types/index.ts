// FitSync Reusable Database & UI Types

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  fitsync_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  fitness_goal?: string;
  location?: string;
  created_at: string;
  updated_at?: string;

  // Extended profile system fields
  cover_url?: string;
  email?: string;
  phone?: string;
  activity_level?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
}

export interface PrivacySettings {
  profile_id: string;
  profile_visibility: 'public' | 'friends' | 'private';
  share_fitness: boolean;
  hide_weight: boolean;
  hide_bmi: boolean;
  hide_online_status: boolean;
  updated_at: string;

  // Extended privacy toggles (Optional for backwards-compatibility)
  hide_height?: boolean;
  hide_age?: boolean;
  hide_progress?: boolean;
}

export interface OnlineStatus {
  profile_id: string;
  is_online?: boolean;
  status?: 'online' | 'offline' | 'away' | 'working_out';
  last_seen: string;
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories: number;
  category: string;
  image_url?: string;
  
  // Legacy fields to prevent UI breakage
  default_duration?: number;
  default_calories?: number;
}

export interface FitnessLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  calories: number;
  water: number;
  workout_minutes: number;
  weight?: number;
  bmi?: number;
  created_at: string;

  // Legacy fields to prevent UI breakage
  profile_id?: string;
  workout_id?: string;
  workout_name?: string;
  category?: string;
  duration_minutes?: number;
  calories_burned?: number;
  notes?: string;
}

export interface StepLog {
  id: string;
  profile_id: string;
  steps: number;
  calories_burned: number;
  date: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  profile_id: string;
  amount_ml: number;
  date: string;
  created_at: string;
}

export interface WeightLog {
  id: string;
  profile_id: string;
  weight_kg: number;
  bmi: number;
  date: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'blocked' | 'expired';
  created_at: string;
  // Joins
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface Friend {
  id: string;
  user1: string;
  user2: string;
  favorite?: boolean;
  created_at: string;
  // Joins
  friend_profile?: UserProfile;
  user_profile?: UserProfile;
  
  // Legacy fields to prevent UI breakage
  user_id?: string;
  friend_id?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  goal?: number;
  created_by?: string; // user id
  created_at: string;
  // Joins
  creator_profile?: UserProfile;
  members_count?: number;

  // Advanced properties
  creator_id?: string;
  banner_url?: string;
  category?: 'steps' | 'calories' | 'workout_minutes' | 'water' | 'weight_loss' | 'running_distance' | 'cycling' | 'yoga' | 'strength_training' | 'hiit' | 'custom';
  goal_value?: number;
  target_unit?: string;
  visibility?: 'public' | 'friends' | 'private';
  max_participants?: number;
  min_participants?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  reward_points?: number;

  // Legacy fields to prevent UI breakage
  type?: string;
  target?: number;
  is_private?: boolean;
  invite_code?: string;
}

export interface ChallengeMember {
  id: string;
  challenge_id: string;
  user_id: string;
  progress?: number;
  status?: 'joined' | 'waiting_list';
  // Joins
  profile?: UserProfile;

  // Legacy fields to prevent UI breakage
  profile_id?: string;
  joined_at?: string;
  is_winner?: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;

  // Legacy fields to prevent UI breakage
  profile_id?: string;
  content?: string;
  data?: any;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  period: 'daily' | 'weekly' | 'monthly';
  created_at: string;
  // Joins
  profile?: UserProfile;

  // Legacy fields to prevent UI breakage
  profile_id?: string;
  steps_total?: number;
  calories_total?: number;
  last_updated?: string;
}

export interface ActivityItem {
  id: string;
  profile_id: string;
  type: 'workout_completed' | 'challenge_joined' | 'achievement_earned' | 'friend_connected';
  content: string;
  data?: any;
  created_at: string;
  // Joins
  profile?: UserProfile;
}
