// FitSync Component: RewardCard
// Lists user point reward milestones with status trackers and Claim buttons

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { LeaderboardReward } from '../../services/reward';

interface RewardCardProps {
  reward: LeaderboardReward;
  onClaim: (id: string) => Promise<void>;
  loading?: boolean;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onClaim,
  loading = false
}) => {
  const [claiming, setClaiming] = React.useState(false);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await onClaim(reward.id);
    } catch {} finally {
      setClaiming(false);
    }
  };

  return (
    <Card variant="glass" className="p-4 flex items-center justify-between gap-4 text-left border border-slate-200/50 dark:border-slate-800/40 rounded-3xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${reward.is_claimed ? 'bg-slate-100 dark:bg-slate-850 text-slate-400' : 'bg-amber-500/10 text-amber-500'}`}>
          <span className="material-symbols-outlined text-[1.4em]">
            {reward.is_claimed ? 'check_circle' : 'database'}
          </span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
            {reward.title}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            +{reward.reward_points.toLocaleString()} XP Points
          </p>
        </div>
      </div>

      <Button
        size="sm"
        disabled={reward.is_claimed || claiming || loading}
        variant={reward.is_claimed ? 'outline' : 'primary'}
        onClick={handleClaim}
        className={reward.is_claimed ? 'border-slate-200 text-slate-400 dark:border-slate-850' : 'shadow shadow-brand-500/10'}
      >
        {reward.is_claimed ? 'Claimed' : 'Claim'}
      </Button>
    </Card>
  );
};

export default RewardCard;
