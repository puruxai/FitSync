// FitSync Component: ParticipantCard
// Renders lists of participant details with profile avatar links

import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../profile/Avatar';
import Card from '../ui/Card';
import type { ChallengeMember } from '../../services/challenge';

interface ParticipantCardProps {
  members: ChallengeMember[];
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ members }) => {
  if (members.length === 0) return null;

  return (
    <Card variant="glass" className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none max-h-60 overflow-y-auto">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
        Challenge Members ({members.length})
      </h4>
      <div className="space-y-3">
        {members.map(m => {
          const profile = m.profile;
          if (!profile) return null;

          return (
            <Link 
              key={m.id} 
              to={`/profile/${profile.id}`} 
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors cursor-pointer"
            >
              <Avatar src={profile.avatar_url} size="sm" alt={profile.full_name} />
              <div>
                <h5 className="text-[11px] font-bold text-slate-850 dark:text-white leading-tight">
                  {profile.full_name}
                </h5>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                  @{profile.username}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

export default ParticipantCard;
