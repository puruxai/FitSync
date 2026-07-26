// FitSync Component: BlockedUserCard
// Renders blocked users list items with options to unblock them

import React from 'react';
import Card from '../ui/Card';
import Avatar from '../profile/Avatar';
import Button from '../ui/Button';
import type { UserProfile } from '../../types';

interface BlockedUserCardProps {
  user: UserProfile;
  onUnblock: (id: string, name: string) => Promise<void>;
  loading?: boolean;
}

export const BlockedUserCard: React.FC<BlockedUserCardProps> = ({
  user,
  onUnblock,
  loading = false
}) => {
  return (
    <Card variant="glass" className="p-4 flex flex-row items-center justify-between gap-4 text-left">
      <div className="flex items-center gap-3">
        <Avatar src={user.avatar_url} size="md" alt={user.full_name} />
        <div>
          <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
            {user.full_name}
          </h4>
          <p className="text-[10px] text-slate-405 dark:text-slate-450 font-semibold mt-0.5">
            @{user.username}
          </p>
        </div>
      </div>

      <div>
        <Button
          size="sm"
          onClick={() => onUnblock(user.id, user.full_name)}
          disabled={loading}
          variant="outline"
          leftIcon="lock_open"
        >
          Unblock
        </Button>
      </div>
    </Card>
  );
};

export default BlockedUserCard;
