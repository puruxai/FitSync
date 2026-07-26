// FitSync Component: ActivityCard
// Renders individual social feed cards (workout milestones, step records, weight trends)

import React from 'react';
import Card from '../ui/Card';
import Avatar from '../profile/Avatar';
import type { FriendActivityItem } from '../../services/activity';

interface ActivityCardProps {
  activity: FriendActivityItem;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const profile = activity.profile;
  if (!profile) return null;

  // Icon type mapping
  const activityIcons: Record<string, { icon: string; color: string; bg: string }> = {
    workout_completed: { icon: 'fitness_center', color: 'text-violet-550', bg: 'bg-violet-500/10' },
    step_goal: { icon: 'directions_walk', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    finished_challenge: { icon: 'emoji_events', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    lost_weight: { icon: 'trending_down', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    new_achievement: { icon: 'trophy', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    joined_challenge: { icon: 'groups', color: 'text-sky-500', bg: 'bg-sky-500/10' },
    personal_record: { icon: 'stars', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    friend_connected: { icon: 'handshake', color: 'text-pink-500', bg: 'bg-pink-500/10' }
  };

  const typeConfig = activityIcons[activity.type] || { icon: 'notifications', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };

  return (
    <Card variant="glass" className="p-4 flex items-start gap-3.5 text-left">
      <Avatar src={profile.avatar_url} size="sm" alt={profile.full_name} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
            {profile.full_name}
          </span>
          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">
            {activity.content}
          </span>
        </div>
        <p className="text-[9px] text-slate-400 font-semibold mt-1">
          {new Date(activity.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className={`p-2 rounded-xl flex items-center justify-center ${typeConfig.bg} ${typeConfig.color}`}>
        <span className="material-symbols-outlined text-[1.3em]">
          {typeConfig.icon}
        </span>
      </div>
    </Card>
  );
};

export default ActivityCard;
