import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import { dbService } from '../services/db';
import type { 
  FitnessLog, StepLog, Challenge, LeaderboardEntry, ActivityItem 
} from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { useGoals } from '../hooks/useGoals';

export const Dashboard: React.FC = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const { 
    liveSteps, liveCalories, liveWater, 
    addLiveWater, addLiveSteps 
  } = useRealtime();

  const { goals } = useGoals(profile?.id);
  const stepsGoal = goals?.steps_goal || 10000;
  const caloriesGoal = goals?.calories_goal || 600;
  const waterGoal = goals?.water_ml_goal || 2500;

  const [loading, setLoading] = useState(true);
  const [weeklyLogs, setWeeklyLogs] = useState<StepLog[]>([]);
  const [fitnessHistory, setFitnessHistory] = useState<FitnessLog[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  // Fetch initial dashboard metrics
  const loadDashboardData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      
      // Load 7 days steps logs
      const stepLogs = await dbService.getStepLogs(profile.id);
      // Take last 7 days or fill up to 7 days
      setWeeklyLogs(stepLogs.slice(0, 7).reverse());

      // Load recent workouts
      const fitLogs = await dbService.getFitnessLogs(profile.id);
      setFitnessHistory(fitLogs.slice(0, 4));

      // Load friends
      await dbService.getFriends(profile.id);

      // Load challenges
      const ch = await dbService.getChallenges();
      setChallenges(ch.slice(0, 3));

      // Load leaderboard
      const lb = await dbService.getLeaderboard('weekly');
      setLeaderboard(lb.slice(0, 5));

      // Load activity feed
      const feed = await dbService.getActivityFeed(profile.id);
      setActivityFeed(feed.slice(0, 5));

    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (profile) {
        loadDashboardData();
      } else {
        setLoading(false);
      }
    }
  }, [profile, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-1/3 h-10" />
          <Skeleton variant="text" className="w-24 h-10 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center space-y-4">
        <Card variant="glass" className="p-12 max-w-md mx-auto">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile Load Error</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Could not fetch your profile data from the server. Please check your network connection or initialize the database tables.
          </p>
        </Card>
      </div>
    );
  }

  // Calculate today's active minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkouts = fitnessHistory.filter(
    l => l.created_at.split('T')[0] === todayStr
  );
  const activeMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

  // BMI calculations
  const weight = profile.weight || 70;
  const height = profile.height || 175;
  const heightInMeters = height / 100;
  const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  
  let bmiCategory = 'Normal';
  let bmiColor = 'text-emerald-500';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-amber-500';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-500';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-500';
  }

  // Prepare chart data (Steps / Calories burned)
  const chartData = weeklyLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
    steps: log.steps,
    calories: log.calories_burned
  }));

  // Quick action mock data step logging
  const handleQuickWalk = () => {
    addLiveSteps(1500); // Walk 1500 steps
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Athlete Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {profile.full_name}! Let's make today count.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleQuickWalk} leftIcon="directions_walk" size="sm">
            Quick Walk (+1.5k steps)
          </Button>
          <Link to="/fitness">
            <Button variant="outline" leftIcon="add" size="sm">
              Log Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Steps Card */}
        <Card className="flex items-center justify-between p-5 relative overflow-hidden" variant="glass">
          <div className="text-left z-10">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-1">Steps Tracker</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{liveSteps.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Goal: {stepsGoal.toLocaleString()} ({Math.min(100, Math.round((liveSteps / stepsGoal) * 100))}% reached)
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-10 dark:opacity-20">
            <span className="material-symbols-outlined text-[4.5rem] text-emerald-500">directions_run</span>
          </div>
        </Card>

        {/* Calories Card */}
        <Card className="flex items-center justify-between p-5 relative overflow-hidden" variant="glass">
          <div className="text-left z-10">
            <p className="text-[10px] font-black uppercase tracking-wider text-orange-500 mb-1">Calories Burned</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{liveCalories} kcal</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Goal: {caloriesGoal} kcal ({Math.min(100, Math.round((liveCalories / caloriesGoal) * 100))}%)
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-10 dark:opacity-20">
            <span className="material-symbols-outlined text-[4.5rem] text-orange-500">local_fire_department</span>
          </div>
        </Card>

        {/* Water Card */}
        <Card className="flex flex-col justify-between p-5 text-left" variant="glass">
          <div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-500">Hydration</p>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => addLiveWater(250)}
                  className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 hover:bg-cyan-100 transition-colors"
                >
                  +250ml
                </button>
                <button 
                  onClick={() => addLiveWater(500)}
                  className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 hover:bg-cyan-100 transition-colors"
                >
                  +500ml
                </button>
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{liveWater} ml</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Goal: {waterGoal} ml ({Math.min(100, Math.round((liveWater / waterGoal) * 100))}%)
            </p>
          </div>
        </Card>

        {/* Active Minutes Card */}
        <Card className="flex items-center justify-between p-5 relative overflow-hidden" variant="glass">
          <div className="text-left z-10">
            <p className="text-[10px] font-black uppercase tracking-wider text-violet-500 mb-1">Workout Minutes</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{activeMinutes} min</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Today's sessions: {todayWorkouts.length}
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-10 dark:opacity-20">
            <span className="material-symbols-outlined text-[4.5rem] text-violet-500">schedule</span>
          </div>
        </Card>

        {/* Weight & BMI Card */}
        <Card className="flex items-center justify-between p-5 relative overflow-hidden" variant="glass">
          <div className="text-left z-10">
            <p className="text-[10px] font-black uppercase tracking-wider text-sky-500 mb-1">Body Stats</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{weight} kg</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              BMI: <span className={`font-bold ${bmiColor}`}>{bmi}</span> ({bmiCategory})
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-10 dark:opacity-20">
            <span className="material-symbols-outlined text-[4.5rem] text-sky-500">monitoring</span>
          </div>
        </Card>
      </div>

      {/* Main Charts & Activity Logs split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between" variant="glass">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Weekly Progress Analysis</h3>
            <div className="flex gap-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-brand-500" />Steps</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500" />Calories</span>
            </div>
          </div>
          
          <div className="h-80 w-full text-xs">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                Log steps to start mapping charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '16px', 
                      color: '#fff',
                      border: 'none'
                    }} 
                  />
                  <Area type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSteps)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Social Feed Widget */}
        <Card className="flex flex-col justify-between" variant="glass">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Friend Activity</h3>
            <Link to="/friends" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
              Find Friends
            </Link>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] text-left pr-1">
            {activityFeed.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No activity logs found. Try adding friends to see their updates!
              </div>
            ) : (
              activityFeed.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={item.profile?.full_name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-900 dark:text-slate-100 leading-tight">
                      <span className="font-bold">{item.profile?.full_name}</span> {item.content}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Leaderboard and Challenge previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leaderboard Preview */}
        <Card variant="glass">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Leaderboard Rankings</h3>
            <Link to="/leaderboard" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
              Full Standings
            </Link>
          </div>

          <div className="space-y-3.5 text-left">
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No rankings data for this week.
              </div>
            ) : (
              leaderboard.slice(0, 3).map((entry, idx) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900/30">
                  <div className="flex items-center gap-3">
                    {/* Rank Number */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                    <img
                      src={entry.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={entry.profile?.full_name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {entry.profile?.full_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">@{entry.profile?.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand-600 dark:text-brand-400">
                      {(entry.steps_total || 0).toLocaleString()} steps
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold">{(entry.calories_total || 0)} kcal</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Challenges Preview */}
        <Card variant="glass">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Active Challenges</h3>
            <Link to="/challenges" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
              View All
            </Link>
          </div>

          <div className="space-y-3.5 text-left">
            {challenges.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active challenges. Log in or create one to compete!
              </div>
            ) : (
              challenges.map(ch => (
                <div key={ch.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900/30">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{ch.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 line-clamp-1">{ch.description}</p>
                    </div>
                    <Badge variant="primary" size="sm">
                      {(ch.type || 'steps').toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1.5">
                      <span>Target: {(ch.target || 0).toLocaleString()}</span>
                      <span>Ends: {new Date(ch.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
