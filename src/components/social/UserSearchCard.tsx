// FitSync Component: UserSearchCard
// Renders user search results with quick action buttons to send friend requests or block users

import React from 'react';
import Card from '../ui/Card';
import Avatar from '../profile/Avatar';
import Button from '../ui/Button';
import type { UserProfile } from '../../types';

interface UserSearchCardProps {
  user: UserProfile;
  onSendRequest: (username: string) => Promise<void>;
  onBlockUser: (id: string, name: string) => Promise<void>;
  loading?: boolean;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({
  user,
  onSendRequest,
  onBlockUser,
  loading = false
}) => {
  const [requestSent, setRequestSent] = React.useState(false);

  const handleSend = async () => {
    try {
      await onSendRequest(user.username);
      setRequestSent(true);
    } catch {}
  };

  return (
    <Card variant="glass" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
      <div className="flex items-center gap-3 w-full">
        <Avatar src={user.avatar_url} size="md" alt={user.full_name} />
        <div>
          <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
            {user.full_name}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            @{user.username} • {user.fitsync_id}
          </p>
          {user.bio && (
            <p className="text-[9px] text-slate-405 dark:text-slate-450 mt-1 line-clamp-1 italic">
              "{user.bio}"
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto justify-end">
        <Button
          size="sm"
          onClick={handleSend}
          disabled={requestSent || loading}
          variant={requestSent ? 'outline' : 'primary'}
          leftIcon={requestSent ? 'check' : 'person_add'}
        >
          {requestSent ? 'Sent' : 'Add Friend'}
        </Button>
        
        <Button
          size="sm"
          onClick={() => onBlockUser(user.id, user.full_name)}
          disabled={loading}
          variant="outline"
          className="border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/30"
          leftIcon="block"
        />
      </div>
    </Card>
  );
};

export default UserSearchCard;
