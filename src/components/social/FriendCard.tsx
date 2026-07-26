// FitSync Component: FriendCard
// Renders active friends with online rings, favorite status stars, and unfriend options

import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Avatar from '../profile/Avatar';
import Button from '../ui/Button';
import type { Friend, OnlineStatus } from '../../types';

interface FriendCardProps {
  friend: Friend;
  onlineStatus?: OnlineStatus;
  onRemove: (friendId: string) => Promise<void>;
  onToggleFavorite: (id: string, isFav: boolean) => Promise<void>;
  onBlockUser: (id: string, name: string) => Promise<void>;
  loading?: boolean;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onlineStatus,
  onRemove,
  onToggleFavorite,
  onBlockUser,
  loading = false
}) => {
  const profile = friend.friend_profile;
  if (!profile) return null;

  const isOnline = onlineStatus?.is_online || false;
  const status = onlineStatus?.is_online ? 'online' : 'offline';

  // Status mapping
  const statusLabels = {
    online: { label: 'Online', color: 'text-emerald-500 bg-emerald-500/10' },
    away: { label: 'Away', color: 'text-amber-500 bg-amber-500/10' },
    working_out: { label: 'Working Out', color: 'text-violet-500 bg-violet-500/10' },
    offline: { label: 'Offline', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' }
  };

  const currentLabel = statusLabels[status];

  return (
    <Card variant="glass" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
      <div className="flex items-center gap-3 w-full">
        <div className="relative">
          <Avatar 
            src={profile.avatar_url} 
            size="md" 
            alt={profile.full_name} 
          />
          {/* Realtime status dot badge */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
              {profile.full_name}
            </h4>
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${currentLabel.color}`}>
              {currentLabel.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            @{profile.username}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Favorite toggle star */}
        <button
          onClick={() => onToggleFavorite(friend.id, !friend.favorite)}
          className={`p-1.5 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${friend.favorite ? 'text-amber-400' : 'text-slate-400'}`}
          title={friend.favorite ? 'Remove from favorites' : 'Mark as favorite'}
        >
          <span className="material-symbols-outlined text-[1.3em]">
            {friend.favorite ? 'star' : 'star_border'}
          </span>
        </button>

        <Link to={`/profile/${profile.id}`}>
          <Button size="sm" variant="outline" leftIcon="visibility">
            View Profile
          </Button>
        </Link>

        {/* Action button menu options */}
        <Button
          size="sm"
          onClick={() => onRemove(profile.id)}
          disabled={loading}
          variant="outline"
          className="border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-505/30"
          leftIcon="person_remove"
        />

        <Button
          size="sm"
          onClick={() => onBlockUser(profile.id, profile.full_name)}
          disabled={loading}
          variant="outline"
          className="border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-505/30"
          leftIcon="block"
        />
      </div>
    </Card>
  );
};

export default FriendCard;
