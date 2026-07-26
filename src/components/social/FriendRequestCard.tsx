// FitSync Component: FriendRequestCard
// Renders incoming pending friend requests with Accept and Decline buttons

import React from 'react';
import Card from '../ui/Card';
import Avatar from '../profile/Avatar';
import Button from '../ui/Button';
import type { FriendRequest } from '../../types';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  loading?: boolean;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  loading = false
}) => {
  const sender = request.sender;
  if (!sender) return null;

  return (
    <Card variant="glass" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
      <div className="flex items-center gap-3 w-full">
        <Avatar src={sender.avatar_url} size="md" alt={sender.full_name} />
        <div>
          <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
            {sender.full_name}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            @{sender.username} • wants to connect
          </p>
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto justify-end">
        <Button
          size="sm"
          onClick={() => onAccept(request.id)}
          disabled={loading}
          leftIcon="check"
        >
          Accept
        </Button>
        <Button
          size="sm"
          onClick={() => onReject(request.id)}
          disabled={loading}
          variant="outline"
          leftIcon="close"
        >
          Ignore
        </Button>
      </div>
    </Card>
  );
};

export default FriendRequestCard;
