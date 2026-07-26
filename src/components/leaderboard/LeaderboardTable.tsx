// FitSync Component: LeaderboardTable
// Renders tabular rows of remaining users with ranks, levels, score outputs, and trend indicators

import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../profile/Avatar';
import Card from '../ui/Card';
import type { LeaderboardScore } from '../../services/leaderboard';

interface LeaderboardTableProps {
  rankings: LeaderboardScore[];
  startIndex?: number; // pagination index offset
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  rankings,
  startIndex = 3
}) => {
  if (rankings.length === 0) return null;

  return (
    <Card variant="glass" className="overflow-hidden p-0 rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/30 text-[9px] sm:text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              <th className="py-4 px-6 text-center w-16">Rank</th>
              <th className="py-4 px-4">Athlete</th>
              <th className="py-4 px-4 text-center w-24">Level</th>
              <th className="py-4 px-4 text-right w-36">Score</th>
              <th className="py-4 px-6 text-center w-20">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30 text-xs">
            {rankings.map((user, idx) => {
              const currentRank = startIndex + idx + 1;
              const profile = user.profile;
              if (!profile) return null;

              // Trend icon & style mapping
              const trendIcons = {
                moved_up: { icon: 'arrow_upward', color: 'text-emerald-500 bg-emerald-500/10' },
                moved_down: { icon: 'arrow_downward', color: 'text-red-500 bg-red-500/10' },
                no_change: { icon: 'remove', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' }
              };

              const trend = trendIcons[user.trend] || trendIcons.no_change;

              return (
                <tr 
                  key={user.id} 
                  className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10 transition-colors"
                >
                  {/* Rank Column */}
                  <td className="py-4 px-6 text-center font-black text-slate-850 dark:text-white">
                    #{currentRank}
                  </td>

                  {/* Athlete Info */}
                  <td className="py-4 px-4">
                    <Link to={`/profile/${profile.id}`} className="flex items-center gap-3 cursor-pointer group">
                      <Avatar src={profile.avatar_url} size="sm" alt={profile.full_name} />
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-white leading-tight group-hover:text-brand-500 transition-colors">
                          {profile.full_name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          @{profile.username} • {profile.fitsync_id}
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Level Badge */}
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-[10px] font-black rounded-lg">
                      Lvl {user.level}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="py-4 px-4 text-right font-black text-slate-800 dark:text-slate-150">
                    {(user.score ?? 0).toLocaleString()}
                  </td>

                  {/* Trend Badge */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${trend.color}`}>
                        <span className="material-symbols-outlined text-sm font-bold">
                          {trend.icon}
                        </span>
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default LeaderboardTable;
