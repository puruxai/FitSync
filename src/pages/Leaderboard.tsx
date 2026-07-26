// FitSync Page: Leaderboard
// Implements enterprise-grade filterable rankings dashboard, rank analytics graph, badges, and claimed points rewards

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useRanking } from '../hooks/useRanking';
import { useRewards } from '../hooks/useRewards';
import { useRankHistory } from '../hooks/useRankHistory';
import Podium from '../components/leaderboard/Podium';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import UserRankCard from '../components/leaderboard/UserRankCard';
import FilterPanel from '../components/leaderboard/FilterPanel';
import PerformanceGraph from '../components/leaderboard/PerformanceGraph';
import RewardCard from '../components/leaderboard/RewardCard';
import AchievementBadge from '../components/leaderboard/AchievementBadge';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const Leaderboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'standings' | 'analytics' | 'rewards'>('standings');

  // Hooks Invocations
  const { rankings, filters, loading, updateFilters } = useLeaderboard(profile?.id);
  const { userScore, userRank } = useRanking(profile?.id, filters.category, filters.period);
  const { badges, rewards, claimPoints, loading: rewardsLoading } = useRewards(profile?.id);
  const { history, loading: historyLoading } = useRankHistory(profile?.id, filters.period);

  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Fitness Leaderboard
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Compete globally or with your friends. Updates in real time.
          </p>
        </div>

        {/* Tab Buttons Selection panel */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 select-none">
          {(['standings', 'analytics', 'rewards'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'rewards' ? 'Badges & Rewards' : tab === 'analytics' ? 'Rank Analytics' : 'Standings'}
            </button>
          ))}
        </div>
      </div>

      {/* Scope Global/Friends Selection panel */}
      {activeTab === 'standings' && (
        <div className="flex justify-end gap-2 select-none">
          {(['global', 'friends'] as const).map(sc => (
            <button
              key={sc}
              onClick={() => updateFilters({ scope: sc })}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize border transition-all cursor-pointer ${
                filters.scope === sc
                  ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
      )}

      {/* Tab 1: Standings Tab */}
      {activeTab === 'standings' && (
        <div className="space-y-8">
          <FilterPanel filters={filters} onFilterChange={updateFilters} />

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-60">
                <Skeleton className="h-full rounded-3xl" />
                <Skeleton className="h-full rounded-3xl" />
                <Skeleton className="h-full rounded-3xl" />
              </div>
              <Skeleton className="h-60 rounded-3xl" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-24 text-center text-slate-400 select-none">
              <span className="material-symbols-outlined text-5xl mb-4">leaderboard</span>
              <p className="text-sm font-semibold">No rankings to display matching filters.</p>
              <p className="text-xs mt-1">Start logging fitness metrics to join the board!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Podium display */}
              <Podium topThree={topThree} />

              {/* Table list grid */}
              {remaining.length > 0 && (
                <LeaderboardTable rankings={remaining} startIndex={3} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Rank Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <UserRankCard userScore={userScore} userRank={userRank} />

          {historyLoading ? (
            <Skeleton className="h-64 rounded-3xl" />
          ) : (
            <PerformanceGraph history={history} />
          )}
        </div>
      )}

      {/* Tab 3: Badges & Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          {/* Awarded badges */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-405 dark:text-slate-400">
              Awarded Badges & Trophies
            </h3>
            {rewardsLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
              </div>
            ) : badges.length === 0 ? (
              <Card variant="glass" className="p-8 text-center text-slate-400 rounded-3xl">
                <span className="material-symbols-outlined text-3xl mb-2">military_tech</span>
                <p className="text-xs font-semibold">No badges earned yet.</p>
                <p className="text-[10px] mt-0.5">Place in top ranks to earn trophies.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.map(b => (
                  <AchievementBadge key={b.id} badge={b} />
                ))}
              </div>
            )}
          </div>

          {/* Claimable points */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-405 dark:text-slate-400">
              Claimable Bonus Points
            </h3>
            {rewardsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-3xl" />
                <Skeleton className="h-20 rounded-3xl" />
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map(r => (
                  <RewardCard key={r.id} reward={r} onClaim={claimPoints} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
