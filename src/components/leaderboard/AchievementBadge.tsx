// FitSync Component: AchievementBadge
// Renders earned milestones and rank badges in a premium card structure

import React from 'react';
import Card from '../ui/Card';
import type { LeaderboardBadge } from '../../services/reward';

interface AchievementBadgeProps {
  badge: LeaderboardBadge;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ badge }) => {
  // Styles for each badge type
  const badgeStyles = {
    top_1: { icon: 'military_tech', label: 'Top 1 Ranker', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    top_3: { icon: 'workspace_premium', label: 'Top 3 Podium', color: 'bg-slate-300/10 text-slate-400 border-slate-300/20' },
    top_10: { icon: 'star', label: 'Top 10 Elite', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    weekly_winner: { icon: 'rewarded_ads', label: 'Weekly Champ', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    monthly_champion: { icon: 'emoji_events', label: 'Monthly Legend', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
    fitness_legend: { icon: 'star_rate', label: 'Fitness Legend', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    consistency_master: { icon: 'history', label: 'Consistency Master', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    challenge_winner: { icon: 'sports_score', label: 'Challenge Conqueror', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' }
  };

  const config = badgeStyles[badge.badge_type] || badgeStyles.top_10;

  return (
    <Card variant="glass" className={`p-4 flex flex-col items-center text-center border rounded-3xl ${config.color}`}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-900/50 shadow-md">
        <span className="material-symbols-outlined text-[1.6em]">
          {config.icon}
        </span>
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-wider mt-3 text-slate-850 dark:text-white leading-tight">
        {badge.title}
      </h4>
      <p className="text-[8px] font-bold text-slate-400 mt-1 select-none">
        {config.label}
      </p>
    </Card>
  );
};

export default AchievementBadge;
