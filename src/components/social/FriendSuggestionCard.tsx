// FitSync Component: FriendSuggestionCard
// Renders suggested athletes you may know with mutual friend indicators and add request options

import React from 'react';
import Card from '../ui/Card';
import Avatar from '../profile/Avatar';
import Button from '../ui/Button';
import type { UserProfile } from '../../types';

interface FriendSuggestionCardProps {
  user: UserProfile;
  onSendRequest: (username: string) => Promise<void>;
  loading?: boolean;
}

export const FriendSuggestionCard: React.FC<FriendSuggestionCardProps> = ({
  user,
  onSendRequest,
  loading = false
}) => {
  const [sent, setSent] = React.useState(false);

  const handleSend = async () => {
    try {
      await onSendRequest(user.username);
      setSent(true);
    } catch {}
  };

  return (
    <Card variant="glass" className="p-4 flex items-center justify-between text-left">
      <div className="flex items-center gap-3">
        <Avatar src={user.avatar_url} size="md" alt={user.full_name} />
        <div>
          <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
            {user.full_name}
          </h4>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
            Suggested for you
          </p>
        </div>
      </div>

      <div>
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sent || loading}
          variant={sent ? 'outline' : 'primary'}
          leftIcon={sent ? 'check' : 'person_add'}
        >
          {sent ? 'Sent' : 'Add'}
        </Button>
      </div>
    </Card>
  );
};

export default FriendSuggestionCard;
