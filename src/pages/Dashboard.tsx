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
  
  // Custom states for premium features
  const [sleepHours, setSleepHours] = useState(7.5);
  const [heartRate, setHeartRate] = useState(72);

  // Heart rate pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(60, Math.min(110, prev + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const stepLogs = await dbService.getStepLogs(profile.id);
      setWeeklyLogs(stepLogs.slice(0, 7).reverse());

      const fitLogs = await dbService.getFitnessLogs(profile.id);
      setFitnessHistory(fitLogs.slice(0, 4));

      await dbService.getFriends(profile.id);

      const ch = await dbService.getChallenges();
      setChallenges(ch.slice(0, 3));

      const lb = await dbService.getLeaderboard('weekly');
      setLeaderboard(lb.slice(0, 5));

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Skeleton className="h-32" />
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
        <div className="p-12 max-w-md mx-auto border border-brand-500/25 bg-slate-900/60 rounded-2xl">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-white mb-2">Profile Load Error</h2>
          <p className="text-sm text-slate-400">
            Could not fetch profile data. Ensure credentials or active sessions are configured.
          </p>
        </div>
      </div>
    );
  }

  const activeMinutes = fitnessHistory.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

  const weight = profile.weight || 70;
  const height = profile.height || 175;
  const heightInMeters = height / 100;
  const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  
  let bmiCategory = 'Normal';
  let bmiColor = 'text-brand-400';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-amber-500';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-400';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-500';
  }

  const chartData = weeklyLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
    steps: log.steps,
    calories: log.calories_burned
  }));

  const handleQuickWalk = () => {
    addLiveSteps(1500);
  };

  const handleAddSleep = () => {
    setSleepHours(prev => Math.min(12, prev + 0.5));
  };

  // Calculate dynamic Activity Heatmap values based on actual logs for the past 28 days
  const heatmapGrid = Array.from({ length: 4 }, (_, wIdx) => {
    return Array.from({ length: 7 }, (_, dIdx) => {
      const dayOffset = (3 - wIdx) * 7 + (6 - dIdx);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - dayOffset);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      const logForDay = fitnessHistory.find((l: any) => l.date === targetDateStr);
      if (!logForDay) return 0;
      
      const stepsRatio = (logForDay.steps || 0) / 10000;
      const workoutRatio = (logForDay.workout_minutes || 0) / 45;
      const intensity = Math.min(1.0, (stepsRatio + workoutRatio) / 2);
      return parseFloat(intensity.toFixed(2));
    });
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8 text-left">
      
      {/* Welcome Header & Live Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            ATHLETE COMMAND CONSOLE
          </h1>
          <p className="text-xs font-black text-brand-400 mt-1 uppercase tracking-widest">
            Welcome back, {profile.full_name} • Status: Peak Condition
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleQuickWalk} leftIcon="directions_walk" size="sm" className="!bg-brand-400 hover:!bg-brand-500 !text-slate-950">
            Quick Walk (+1.5k)
          </Button>
          <Link to="/fitness">
            <Button variant="outline" leftIcon="add" size="sm" className="border-brand-500/30 text-brand-400 hover:border-brand-500">
              Log Workout
            </Button>
          </Link>
          <Button onClick={handleAddSleep} leftIcon="bedtime" size="sm" className="border-slate-800 text-slate-400 hover:text-white">
            Log Sleep (+0.5h)
          </Button>
        </div>
      </div>

      {/* Metric Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Steps Tracker */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-brand-500/20 transition-all shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Steps Count</span>
            <h3 className="text-3xl font-black text-white mt-2">{liveSteps.toLocaleString()}</h3>
            <div className="w-full bg-slate-850 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-brand-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#39ff14]" 
                style={{ width: `${Math.min(100, (liveSteps / stepsGoal) * 100)}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Goal: {stepsGoal.toLocaleString()}</p>
          </div>
          <span className="material-symbols-outlined absolute right-4 top-4 text-[4rem] text-brand-400/5 select-none pointer-events-none">directions_run</span>
        </div>

        {/* Calories Burned */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-brand-500/20 transition-all shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Burn Rate</span>
            <h3 className="text-3xl font-black text-white mt-2">{liveCalories} kcal</h3>
            <div className="w-full bg-slate-850 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-brand-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#39ff14]" 
                style={{ width: `${Math.min(100, (liveCalories / caloriesGoal) * 100)}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Goal: {caloriesGoal} kcal</p>
          </div>
          <span className="material-symbols-outlined absolute right-4 top-4 text-[4rem] text-brand-400/5 select-none pointer-events-none">local_fire_department</span>
        </div>

        {/* Water Hydration */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-brand-500/20 transition-all shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Hydration</span>
              <div className="flex gap-1">
                <button onClick={() => addLiveWater(250)} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-brand-400 border border-slate-700 hover:bg-slate-700">
                  +250ml
                </button>
                <button onClick={() => addLiveWater(500)} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-brand-400 border border-slate-700 hover:bg-slate-700">
                  +500ml
                </button>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mt-2">{liveWater} ml</h3>
            <div className="w-full bg-slate-850 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-brand-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#39ff14]" 
                style={{ width: `${Math.min(100, (liveWater / waterGoal) * 100)}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Goal: {waterGoal} ml</p>
          </div>
          <span className="material-symbols-outlined absolute right-4 top-4 text-[4rem] text-brand-400/5 select-none pointer-events-none">water_drop</span>
        </div>

        {/* Heart Rate (Simulated Pulsing SVG) */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-brand-500/20 transition-all shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Pulse Rate</span>
            <div className="flex items-center gap-2 mt-2">
              <h3 className="text-3xl font-black text-white">{heartRate}</h3>
              <span className="text-xs font-bold text-slate-400">bpm</span>
              <span className="material-symbols-outlined text-brand-400 text-xl animate-pulse">favorite</span>
            </div>
            <div className="h-6 mt-3">
              <svg className="w-full h-full stroke-brand-400 fill-none" viewBox="0 0 100 20">
                <path d="M0 10 L30 10 L35 2 L40 18 L45 10 L50 10 L55 2 L60 18 L65 10 L100 10" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-brand-500/20 transition-all shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Rest Sleep</span>
            <h3 className="text-3xl font-black text-white mt-2">{sleepHours} hrs</h3>
            <div className="w-full bg-slate-850 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-brand-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#39ff14]" 
                style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Optimal: 8.0 hrs</p>
          </div>
          <span className="material-symbols-outlined absolute right-4 top-4 text-[4rem] text-brand-400/5 select-none pointer-events-none">bedtime</span>
        </div>

        {/* Weight & BMI Body Stats */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-brand-500/20 transition-all shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Body Stats</span>
            <h3 className="text-3xl font-black text-white mt-2">{weight} kg</h3>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">
              BMI: <span className={`font-black ${bmiColor}`}>{bmi}</span> • {bmiCategory}
            </p>
          </div>
          <span className="material-symbols-outlined absolute right-4 top-4 text-[4rem] text-brand-400/5 select-none pointer-events-none">monitoring</span>
        </div>
      </div>

      {/* Charts / Heatmap Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">WEEKLY INTENSITY</h3>
            <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-400" />Steps</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white" />Calories</span>
            </div>
          </div>
          
          <div className="h-72 w-full text-xs">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-wider">
                Waiting for fitness metrics logs...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39ff14" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0c0c0c', 
                      borderRadius: '12px', 
                      color: '#fff',
                      border: '1px solid #1a1a1a'
                    }} 
                  />
                  <Area type="monotone" dataKey="steps" stroke="#39ff14" strokeWidth={2} fillOpacity={1} fill="url(#colorSteps)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Heatmap widget */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">ACTIVITY HEATMAP</h3>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Active steps: {liveSteps.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-7 gap-2 my-auto">
            {/* Days of week labels */}
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div key={idx} className="text-center text-[9px] font-bold text-slate-600 uppercase">{day}</div>
            ))}

            {heatmapGrid.map((row, rIdx) => 
              row.map((val, cIdx) => {
                let opacity = 'bg-slate-900';
                if (val > 0.8) opacity = 'bg-brand-400 shadow-[0_0_10px_#39ff14]';
                else if (val > 0.5) opacity = 'bg-brand-400/60';
                else if (val > 0.2) opacity = 'bg-brand-400/35';
                else if (val > 0) opacity = 'bg-brand-400/15';

                return (
                  <div 
                    key={`${rIdx}-${cIdx}`} 
                    className={`h-7 rounded transition-all duration-300 ${opacity}`}
                    title={`Intensity: ${Math.round(val * 100)}%`}
                  />
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase mt-4">
            <span>LESS</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-slate-900" />
              <div className="w-2.5 h-2.5 rounded bg-brand-400/15" />
              <div className="w-2.5 h-2.5 rounded bg-brand-400/35" />
              <div className="w-2.5 h-2.5 rounded bg-brand-400/60" />
              <div className="w-2.5 h-2.5 rounded bg-brand-400" />
            </div>
            <span>MORE</span>
          </div>
        </div>
      </div>

      {/* Calendar / Achievements / Challenges Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workout Calendar Widget */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">WORKOUT SCHEDULE</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const isToday = idx === (new Date().getDay() - 1 + 7) % 7;
                return (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-xl text-center border transition-all ${
                      isToday 
                        ? 'bg-brand-400 text-slate-950 border-brand-400 shadow-[0_0_12px_rgba(57,255,20,0.3)]' 
                        : 'bg-slate-900/60 border-slate-850 text-slate-400'
                    }`}
                  >
                    <p className="text-[8px] font-bold uppercase">{day}</p>
                    <p className="text-xs font-black mt-1">{20 + idx}</p>
                    {idx % 2 === 0 && (
                      <div className={`h-1 w-1 mx-auto rounded-full mt-1.5 ${isToday ? 'bg-slate-950' : 'bg-brand-400'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-900/60 border border-slate-850 rounded-xl text-left flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-black text-white uppercase">Today's Routine</h4>
              <p className="text-xs font-bold text-brand-400 mt-0.5">Heavy Squats & Abs Core • {activeMinutes}m active</p>
            </div>
            <span className="material-symbols-outlined text-brand-400 text-xl animate-pulse">check_circle</span>
          </div>
        </div>

        {/* Athlete Achievements */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900">
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">EARNED ACHIEVEMENTS</h3>
          <div className="space-y-3">
            {[
              { title: 'Iron Will', desc: 'Complete 5 fitness workout sessions.', icon: 'military_tech', done: true },
              { title: 'Hydration Hero', desc: 'Reach daily water target 3 times.', icon: 'workspace_premium', done: true },
              { title: 'Daily Runner', desc: 'Log 15,000 steps inside a single day.', icon: 'emoji_events', done: false }
            ].map((ach, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
                <span className={`material-symbols-outlined text-2xl ${ach.done ? 'text-brand-400' : 'text-slate-600'}`}>
                  {ach.icon}
                </span>
                <div className="text-left flex-grow">
                  <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">{ach.desc}</p>
                </div>
                {ach.done && (
                  <span className="material-symbols-outlined text-brand-400 text-sm font-black">check</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Challenges preview */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">ACTIVE CHALLENGES</h3>
            <Link to="/challenges" className="text-[10px] font-black text-brand-400 hover:text-brand-500 uppercase tracking-wider">
              Browse All
            </Link>
          </div>

          <div className="space-y-4 text-left">
            {challenges.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No active challenges.
              </div>
            ) : (
              challenges.map(ch => (
                <div key={ch.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{ch.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{ch.description}</p>
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
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Social Standings & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard rankings list */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 text-left">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">LEADERBOARD STANDINGS</h3>
            <Link to="/leaderboard" className="text-[10px] font-black text-brand-400 hover:text-brand-500 uppercase tracking-wider">
              FULL LIST
            </Link>
          </div>
          <div className="space-y-3.5">
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No active leaderboard entries.
              </div>
            ) : (
              leaderboard.slice(0, 3).map((entry, idx) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-brand-400"># {idx + 1}</span>
                    <img
                      src={entry.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={entry.profile?.full_name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[120px]">{entry.profile?.full_name}</p>
                      <p className="text-[9px] text-slate-400">@{entry.profile?.username}</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-black text-brand-400">
                    {(entry.steps_total || 0).toLocaleString()} steps
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Friend activity feed */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 text-left">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">FRIEND ACTIVITY</h3>
            <Link to="/friends" className="text-[10px] font-black text-brand-400 hover:text-brand-500 uppercase tracking-wider">
              SEE FRIENDS
            </Link>
          </div>
          <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
            {activityFeed.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No recent activity logs.
              </div>
            ) : (
              activityFeed.slice(0, 3).map(item => (
                <div key={item.id} className="flex gap-2.5 items-start">
                  <img
                    src={item.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={item.profile?.full_name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="flex-grow">
                    <p className="text-[11px] text-slate-200">
                      <span className="font-bold text-white">{item.profile?.full_name}</span> {item.content}
                    </p>
                    <p className="text-[9px] text-slate-500">{new Date(item.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Notifications Summary */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 text-left">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">LIVE ALERTS</h3>
            <Link to="/notifications" className="text-[10px] font-black text-brand-400 hover:text-brand-500 uppercase tracking-wider">
              VIEW ALL
            </Link>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-brand-400 text-2xl animate-bounce">notifications_active</span>
              <div>
                <h4 className="text-xs font-bold text-white">Daily Workout Target</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">Let's finish the workout calendar logs today.</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-brand-400 animate-ping" />
          </div>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
