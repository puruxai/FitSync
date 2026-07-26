// FitSync Page: Profile
// Displays the athlete profile sheet including cover photos, statistics cards, social badges, and unlocks, respecting user privacy configuration.

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useProfileStats } from '../hooks/useProfileStats';
import { useProfilePrivacy } from '../hooks/useProfilePrivacy';
import { dbService } from '../services/db';
import type { Friend, FitnessLog } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStatsCard from '../components/profile/ProfileStatsCard';
import AchievementCard from '../components/profile/AchievementCard';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile: currentUser } = useAuth();
  
  // Resolve who's profile we are looking at
  const targetUserId = id || currentUser?.id || '';
  const isOwnProfile = targetUserId === currentUser?.id;

  const { profile, loading: profileLoading, error: profileError } = useProfile(targetUserId);
  const { stats, loading: statsLoading, recalculate } = useProfileStats(targetUserId);
  const { privacy, loading: privacyLoading } = useProfilePrivacy(targetUserId);

  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<FitnessLog[]>([]);
  const [checkingFriendship, setCheckingFriendship] = useState(false);

  useEffect(() => {
    const checkSocialInfo = async () => {
      if (!currentUser || !targetUserId) return;
      try {
        setCheckingFriendship(true);
        if (!isOwnProfile) {
          const list = await dbService.getFriends(currentUser.id);
          setFriendsList(list);
        }
        const logs = await dbService.getFitnessLogs(targetUserId);
        setWorkoutLogs(logs);
      } catch (err) {
        console.error('Failed to load social/log details:', err);
      } finally {
        setCheckingFriendship(false);
      }
    };
    checkSocialInfo();
  }, [currentUser, targetUserId, isOwnProfile]);

  const loading = profileLoading || statsLoading || privacyLoading || checkingFriendship;

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-64 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="p-12 text-center text-slate-400">
        <span className="material-symbols-outlined text-5xl mb-4 text-red-500">error</span>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Profile Load Error</h2>
        <p className="text-xs mt-2 font-semibold">The requested athlete record was not found or is inaccessible.</p>
        <Link to="/dashboard" className="inline-block mt-6">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Determine friendship status
  const isFriend = friendsList.some(
    f => (f.friend_id === targetUserId || f.user_id === targetUserId)
  );

  // Check Privacy Visibilities
  const visibility = privacy?.profile_visibility || 'public';
  const isPrivateAndHidden = !isOwnProfile && (
    (visibility === 'private') ||
    (visibility === 'friends' && !isFriend)
  );

  if (isPrivateAndHidden) {
    return (
      <div className="p-12 text-center text-slate-400 max-w-lg mx-auto mt-12 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl shadow-sm">
        <span className="material-symbols-outlined text-6xl mb-4 text-brand-500">lock</span>
        <h2 className="text-base font-black text-slate-900 dark:text-white">This Profile is Private</h2>
        <p className="text-xs mt-2 font-semibold leading-relaxed">
          {visibility === 'friends' 
            ? 'Only mutual friends of this athlete can view their progress details.'
            : 'This user has restricted access to their dashboard information.'}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/friends"><Button variant="primary">View Social Circle</Button></Link>
          <Link to="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  // Granular Toggles Checks
  const showWeight = isOwnProfile || !privacy?.hide_weight;
  const showHeight = isOwnProfile || !privacy?.hide_height;
  const showProgress = isOwnProfile || !privacy?.share_fitness === false;

  // Achievements List
  const totalWorkouts = stats?.total_workouts || 0;
  const achievementsList = [
    {
      id: 'ach-1',
      title: 'First Step',
      description: 'Logged your first workout session on FitSync.',
      icon: 'star',
      color: 'bg-yellow-500 text-white',
      unlocked: totalWorkouts > 0
    },
    {
      id: 'ach-2',
      title: 'Calorie Crusher',
      description: 'Burned a total of 1,000+ kcal through active exercises.',
      icon: 'local_fire_department',
      color: 'bg-orange-500 text-white',
      unlocked: (stats?.avg_calories || 0) * (stats?.total_workouts || 0) >= 1000
    },
    {
      id: 'ach-3',
      title: 'Streak Starter',
      description: 'Maintained an active streak of 3+ consecutive days.',
      icon: 'local_activity',
      color: 'bg-violet-500 text-white',
      unlocked: (stats?.workout_streak || 0) >= 3
    },
    {
      id: 'ach-4',
      title: 'Goal Getter',
      description: 'Declared a customized fitness goal on your profile.',
      icon: 'emoji_events',
      color: 'bg-emerald-500 text-white',
      unlocked: !!profile.fitness_goal
    }
  ];

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* 1. Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFriend={isFriend}
        privacy={privacy}
        onRecalculate={recalculate}
      />

      {/* 2. Grid: Health Summaries & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main active dashboard progress */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ProfileStatsCard
              title="Workout Streak"
              value={`${stats?.workout_streak || 0} Days`}
              subtext="Consecutive days active"
              icon="local_fire_department"
              iconColor="text-orange-500"
              showValue={showProgress}
            />

            <ProfileStatsCard
              title="Average Steps"
              value={(stats?.avg_daily_steps || 0).toLocaleString()}
              subtext="Steps per day"
              icon="directions_walk"
              iconColor="text-brand-500"
              showValue={showProgress}
            />

            <ProfileStatsCard
              title="Avg Calories"
              value={`${(stats?.avg_calories || 0).toLocaleString()} kcal`}
              subtext="Burned per day"
              icon="local_fire_department"
              iconColor="text-rose-500"
              showValue={showProgress}
            />
          </div>

          {/* Goal & Biometrics Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fitness Goal */}
            <Card variant="glass" className="p-5 text-left flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1.5">Active Fitness Goal</h3>
                <p className="text-[9px] text-slate-400 font-semibold mb-3">Goal declaration for tracking targets.</p>
              </div>
              <div className="p-3 bg-brand-50/20 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-950 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-brand-650 bg-brand-50 dark:bg-brand-950 p-2 rounded-xl">emoji_events</span>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold">Current Target</p>
                  <p className="text-xs font-black text-brand-600 dark:text-brand-400 mt-0.5">{profile.fitness_goal || 'Stay Active'}</p>
                </div>
              </div>
            </Card>

            {/* Biometrics Display */}
            <Card variant="glass" className="p-5 text-left">
              <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1.5">Athlete Biometrics</h3>
              <p className="text-[9px] text-slate-400 font-semibold mb-3">Granular stats (respecting privacy parameters).</p>
              
              <div className="space-y-2 text-xs font-bold divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Height:</span>
                  <span>{showHeight && profile.height ? `${profile.height} cm` : '🔒 Private'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Weight:</span>
                  <span>{showWeight && stats?.current_weight ? `${stats.current_weight} kg` : '🔒 Private'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Current BMI:</span>
                  <span>{showWeight && stats?.current_bmi ? `${stats.current_bmi}` : '🔒 Private'}</span>
                </div>
                {profile.activity_level && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Activity Level:</span>
                    <span>{profile.activity_level}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Social Progress Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ProfileStatsCard
              title="Total Logged"
              value={totalWorkouts}
              subtext="Workouts completed"
              showValue={true}
            />

            <ProfileStatsCard
              title="Social Circle"
              value={stats?.friends_count || 0}
              subtext="Friends connected"
              showValue={true}
            />

            <ProfileStatsCard
              title="Challenges"
              value={stats?.challenges_completed || 0}
              subtext="Completed successfully"
              showValue={true}
            />
          </div>

          {/* Recent Workout History */}
          <Card variant="glass" className="p-6 text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6">Recent Workouts History</h3>
            {workoutLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                <span className="material-symbols-outlined text-4xl mb-2">fitness_center</span>
                <p>No workouts recorded recently.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {workoutLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl text-brand-500 bg-brand-50 dark:bg-brand-950 p-2 rounded-xl">
                        {log.category === 'cardio' ? 'directions_run' : log.category === 'strength' ? 'fitness_center' : log.category === 'yoga' ? 'self_improvement' : 'sports_gymnastics'}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{log.workout_name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Duration: {log.duration_minutes} min | Category: {log.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="primary" size="sm">-{log.calories_burned} kcal</Badge>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: Achievements unlocked */}
        <Card variant="glass" className="p-6 text-left h-fit">
          <div className="flex justify-between items-baseline mb-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Unlocked Badges</h3>
            <span className="text-[10px] font-bold text-slate-400">{unlockedCount} / {achievementsList.length} Unlocked</span>
          </div>

          <div className="space-y-4">
            {achievementsList.map(a => (
              <AchievementCard
                key={a.id}
                title={a.title}
                description={a.description}
                icon={a.icon}
                color={a.color}
                unlocked={a.unlocked}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
