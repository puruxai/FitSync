// FitSync Component: InviteDialog
// Renders lists of friends with quick-invite buttons to join challenges

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../profile/Avatar';
import { FriendService } from '../../services/friend';

interface InviteDialogProps {
  challengeId: string;
  senderId: string;
  onSendInvite: (challengeId: string, friendId: string) => Promise<any>;
}

export const InviteDialog: React.FC<InviteDialogProps> = ({
  challengeId,
  senderId,
  onSendInvite
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);
        const data = await FriendService.getFriends(senderId);
        setFriends(data);
      } catch (err) {
        console.error('Failed to load friends for invite:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, [senderId]);

  const handleInvite = async (friendId: string) => {
    try {
      await onSendInvite(challengeId, friendId);
      setInvited(prev => ({
        ...prev,
        [friendId]: true
      }));
    } catch {}
  };

  return (
    <Card variant="glass" className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
        Invite Friends to Challenge
      </h4>

      {loading ? (
        <p className="text-slate-400 text-xs font-semibold py-4 text-center">Loading friends list...</p>
      ) : friends.length === 0 ? (
        <p className="text-slate-400 text-xs font-semibold py-4 text-center">No friends available to invite.</p>
      ) : (
        <div className="space-y-3 max-h-52 overflow-y-auto">
          {friends.map(f => {
            const profile = f.friend_profile;
            if (!profile) return null;

            const isInvited = invited[profile.id] || false;

            return (
              <div 
                key={f.id} 
                className="flex items-center justify-between gap-3 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/40"
              >
                <div className="flex items-center gap-2">
                  <Avatar src={profile.avatar_url} size="sm" alt={profile.full_name} />
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-850 dark:text-white leading-tight">
                      {profile.full_name}
                    </h5>
                    <p className="text-[9px] text-slate-405">@{profile.username}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={isInvited}
                  variant={isInvited ? 'outline' : 'primary'}
                  onClick={() => handleInvite(profile.id)}
                >
                  {isInvited ? 'Invited' : 'Invite'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default InviteDialog;
