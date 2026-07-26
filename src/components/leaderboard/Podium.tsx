// FitSync Component: Podium
// Renders the top 3 leader standings on a visually stunning Gold/Silver/Bronze podium pedestal

import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../profile/Avatar';
import type { LeaderboardScore } from '../../services/leaderboard';

interface PodiumProps {
  topThree: LeaderboardScore[];
}

export const Podium: React.FC<PodiumProps> = ({ topThree }) => {
  if (topThree.length === 0) return null;

  // Podium order: 2nd Place, 1st Place, 3rd Place
  const orderedStandings = [
    topThree[1] || null, // 2nd
    topThree[0] || null, // 1st
    topThree[2] || null  // 3rd
  ];

  const podiumConfigs = [
    {
      place: 2,
      medal: '🥈',
      color: 'from-slate-350 to-slate-200 border-slate-300 dark:border-slate-700',
      text: 'text-slate-500 dark:text-slate-400',
      badgeColor: 'bg-slate-200 text-slate-800',
      height: 'h-40 sm:h-44'
    },
    {
      place: 1,
      medal: '🏆',
      color: 'from-amber-400 to-yellow-250 border-amber-500 shadow-amber-500/10 scale-105 sm:scale-110 z-10',
      text: 'text-amber-500 dark:text-amber-400',
      badgeColor: 'bg-amber-500 text-white animate-pulse',
      height: 'h-48 sm:h-56'
    },
    {
      place: 3,
      medal: '🥉',
      color: 'from-amber-700 to-amber-600 border-amber-800 dark:border-amber-900',
      text: 'text-amber-750 dark:text-amber-500',
      badgeColor: 'bg-amber-750 text-white',
      height: 'h-36 sm:h-36'
    }
  ];

  return (
    <div className="flex justify-center items-end gap-3 sm:gap-6 pt-12 pb-6 max-w-2xl mx-auto">
      {orderedStandings.map((user, idx) => {
        if (!user) return <div key={idx} className="flex-1 opacity-0 pointer-events-none" />;

        const config = podiumConfigs[idx];

        return (
          <div key={user.id} className="flex-1 flex flex-col items-center select-none group transition-all duration-300">
            {/* Avatar & Hover Glows */}
            <Link to={`/profile/${user.profile?.id}`} className="relative flex flex-col items-center mb-4 cursor-pointer">
              <div className="relative p-1 rounded-full group-hover:scale-105 transition-transform duration-300">
                <Avatar 
                  src={user.profile?.avatar_url} 
                  size={config.place === 1 ? 'lg' : 'md'} 
                  alt={user.profile?.full_name || 'Athlete'} 
                />
                <span className="absolute -top-1.5 -right-1.5 text-2xl filter drop-shadow">
                  {config.medal}
                </span>
              </div>
              <span className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${config.badgeColor}`}>
                Rank {config.place}
              </span>
            </Link>

            {/* Profile User Info */}
            <div className="text-center w-full mt-2">
              <h4 className="text-[10px] sm:text-xs font-black text-slate-850 dark:text-white leading-tight line-clamp-1">
                {user.profile?.full_name}
              </h4>
              <p className="text-[8px] sm:text-[9px] text-slate-400 font-semibold mt-0.5">
                @{user.profile?.username}
              </p>
            </div>

            {/* Pedestal Container block */}
            <div className={`w-full mt-4 bg-gradient-to-b ${config.color} border border-b-0 rounded-t-3xl flex flex-col items-center justify-between p-4 ${config.height} shadow-lg transition-transform duration-300 group-hover:-translate-y-1`}>
              <div className="flex flex-col items-center mt-2">
                <span className={`text-xl sm:text-3xl font-black ${config.text}`}>
                  #{config.place}
                </span>
                <span className="text-[7px] sm:text-[9px] font-bold tracking-widest uppercase opacity-60 mt-1 dark:text-white">
                  Place
                </span>
              </div>

              <div className="text-center mb-2">
                <div className="text-xs sm:text-base font-black text-slate-850 dark:text-slate-900 line-clamp-1">
                  {(user.score ?? 0).toLocaleString()}
                </div>
                <div className="text-[6px] sm:text-[8px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-750">
                  {user.category}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Podium;
