// FitSync Component: AdminAnalytics
// Displays total users, daily active stats, database health, and realtime connections dials

import React from 'react';
import Card from '../ui/Card';
import type { AdminDashboardStats } from '../../services/admin';

interface AdminAnalyticsProps {
  stats: AdminDashboardStats;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ stats }) => {
  const cards = [
    { label: 'Total Users Registered', val: stats.totalUsers, icon: 'group', color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Active Members', val: stats.activeUsers, icon: 'trending_up', color: 'text-emerald-500 bg-emerald-550/10' },
    { label: 'Live Online presence', val: stats.onlineUsers, icon: 'sensors', color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'New Signups Today', val: stats.newUsersToday, icon: 'person_add', color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Total Workouts Routines', val: stats.totalWorkouts, icon: 'fitness_center', color: 'text-orange-500 bg-orange-500/10' },
    { label: 'Active Challenges', val: stats.totalChallenges, icon: 'emoji_events', color: 'text-amber-500 bg-amber-500/10' },
    { label: 'AI Coach Dialogues', val: stats.aiUsageCount, icon: 'psychology', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Database Health', val: stats.databaseHealth, icon: 'database', color: 'text-teal-500 bg-teal-500/10' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left select-none">
      {cards.map((c, idx) => (
        <Card 
          key={idx} 
          variant="glass" 
          className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-slate-400">{c.label}</span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
              {c.val}
            </h4>
          </div>

          <span className={`material-symbols-outlined text-xl p-2 rounded-xl h-fit ${c.color}`}>
            {c.icon}
          </span>
        </Card>
      ))}
    </div>
  );
};

export default AdminAnalytics;
