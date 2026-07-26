// FitSync Component: ChallengeCard
// Renders responsive cards containing challenge details, participant counts, goals, and join triggers

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Challenge } from '../../services/challenge';

interface ChallengeCardProps {
  challenge: Challenge;
  hasJoined: boolean;
  onJoin: (id: string) => Promise<void>;
  onLeave: (id: string) => Promise<void>;
  onSelect: (challenge: Challenge) => void;
  loading?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  hasJoined,
  onJoin,
  onLeave,
  onSelect,
  loading = false
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal trigger
    try {
      setSubmitting(true);
      if (hasJoined) {
        await onLeave(challenge.id);
      } else {
        await onJoin(challenge.id);
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  // Difficulty badge styling
  const diffStyles = {
    beginner: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    advanced: 'bg-red-500/10 text-red-500 border border-red-500/20'
  };

  const currentDiff = diffStyles[challenge.difficulty] || diffStyles.intermediate;

  return (
    <Card 
      variant="glass" 
      onClick={() => onSelect(challenge)}
      className="overflow-hidden flex flex-col justify-between text-left h-full border border-slate-200/50 dark:border-slate-800/40 rounded-3xl hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
    >
      <div>
        {/* Banner image block */}
        <div className="h-32 w-full relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <img
            src={challenge.banner_url || 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400'}
            alt={challenge.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Difficulty and Reward Badges */}
          <span className={`absolute top-3 left-3 px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${currentDiff}`}>
            {challenge.difficulty}
          </span>
          
          <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-yellow-500 text-white text-[8px] font-black uppercase rounded-lg shadow">
            +{challenge.reward_points} XP
          </span>
        </div>

        {/* Content body details */}
        <div className="p-4 sm:p-5">
          <h3 className="text-sm font-black text-slate-850 dark:text-white leading-tight line-clamp-1">
            {challenge.title}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1 line-clamp-2">
            {challenge.description || 'No description provided.'}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-4 border-t border-slate-100 dark:border-slate-800/30 pt-4">
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Target Goal</span>
              <p className="text-xs font-black text-slate-800 dark:text-slate-150 mt-0.5">
                {(challenge.goal_value ?? 0).toLocaleString()} {challenge.target_unit}
              </p>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Participants</span>
              <p className="text-xs font-black text-slate-800 dark:text-slate-150 mt-0.5">
                {challenge.members_count} / {challenge.max_participants}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join button block */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <Button
          size="sm"
          onClick={handleAction}
          disabled={submitting || loading}
          variant={hasJoined ? 'outline' : 'primary'}
          className="w-full mt-2"
        >
          {hasJoined ? 'Leave Challenge' : 'Join Challenge'}
        </Button>
      </div>
    </Card>
  );
};

export default ChallengeCard;
