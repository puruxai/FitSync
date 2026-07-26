// FitSync Component: ChallengeLeaderboard
// Lists rankings of challenge participants by progress scores

import React from 'react';
import Avatar from '../profile/Avatar';
import Card from '../ui/Card';
import type { ChallengeRank } from '../../services/challengeLeaderboard';

interface ChallengeLeaderboardProps {
  standings: ChallengeRank[];
  unit: string;
}

export const ChallengeLeaderboard: React.FC<ChallengeLeaderboardProps> = ({
  standings,
  unit
}) => {
  if (standings.length === 0) return null;

  return (
    <Card variant="glass" className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none max-h-60 overflow-y-auto">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
        Rank Standings
      </h4>
      <div className="space-y-3">
        {standings.map((st, idx) => {
          const profile = st.profile;
          if (!profile) return null;

          return (
            <div 
              key={st.user_id} 
              className="flex items-center justify-between gap-3 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/40"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black text-slate-400 w-5">
                  #{idx + 1}
                </span>
                <Avatar src={profile.avatar_url} size="sm" alt={profile.full_name} />
                <div>
                  <h5 className="text-[11px] font-bold text-slate-850 dark:text-white leading-tight">
                    {profile.full_name}
                  </h5>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                    @{profile.username}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">
                {st.score.toLocaleString()} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ChallengeLeaderboard;
