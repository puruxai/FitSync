// FitSync Component: UserRankCard
// Displays a premium card with the current user's current rank, trend, and best stats

import React from 'react';
import Card from '../ui/Card';
import type { LeaderboardScore } from '../../services/leaderboard';

interface UserRankCardProps {
  userScore: LeaderboardScore | null;
  userRank: number;
}

export const UserRankCard: React.FC<UserRankCardProps> = ({
  userScore,
  userRank
}) => {
  const isRanked = userRank > 0 && userScore !== null;

  // Trend mapping
  const trendLabels = {
    moved_up: { label: 'Moved Up', icon: 'trending_up', color: 'text-emerald-500 bg-emerald-500/10' },
    moved_down: { label: 'Moved Down', icon: 'trending_down', color: 'text-red-500 bg-red-500/10' },
    no_change: { label: 'Stable', icon: 'trending_flat', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' }
  };

  const currentTrend = isRanked ? (trendLabels[userScore.trend] || trendLabels.no_change) : trendLabels.no_change;

  return (
    <Card variant="glass" className="p-5 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-brand-600/5 to-violet-500/5 border border-brand-500/10 rounded-3xl">
      <div className="flex items-center gap-4 text-left w-full md:w-auto">
        <div className="w-14 h-14 bg-brand-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
          <span className="material-symbols-outlined text-2xl">leaderboard</span>
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-850 dark:text-white leading-tight">
            Your Leaderboard Ranking
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Keep stepping to climb ranks and claim rewards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 sm:gap-12 w-full md:w-auto">
        {/* Current Rank */}
        <div className="text-center md:text-left select-none">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Current Rank
          </div>
          <div className="text-lg sm:text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
            {isRanked ? `#${userRank}` : '—'}
          </div>
        </div>

        {/* Score */}
        <div className="text-center md:text-left select-none">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total Score
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-150 mt-1">
            {isRanked ? userScore.score.toLocaleString() : '—'}
          </div>
        </div>

        {/* Trend */}
        <div className="text-center md:text-left select-none">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Trend
          </div>
          {isRanked ? (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase mt-2.5 ${currentTrend.color}`}>
              <span className="material-symbols-outlined text-xs font-bold">{currentTrend.icon}</span>
              {currentTrend.label}
            </span>
          ) : (
            <div className="text-lg sm:text-2xl font-black text-slate-400 mt-1">—</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserRankCard;
