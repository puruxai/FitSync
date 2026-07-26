// FitSync Component: ProfileHeader
// A reusable component rendering the athlete cover image, avatar overlay, location/join dates, social links, and edit/request action buttons

import React from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile, PrivacySettings } from '../../types';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from './Avatar';
import SocialLinks from './SocialLinks';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isFriend: boolean;
  privacy?: PrivacySettings | null;
  onRecalculate?: () => void;
  onSendFriendRequest?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFriend,
  privacy,
  onRecalculate,
  onSendFriendRequest
}) => {
  const showOnline = isOwnProfile || !privacy?.hide_online_status;

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      {/* Cover Photo Backdrop */}
      <div className="h-44 sm:h-64 w-full relative overflow-hidden bg-gradient-to-tr from-brand-650 to-indigo-650">
        {profile.cover_url ? (
          <img 
            src={profile.cover_url} 
            alt="Cover background" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}
      </div>

      {/* Profile Bio details */}
      <div className="px-6 pb-6 pt-16 sm:pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative">
        {/* Floating Avatar overlay */}
        <div className="absolute -top-16 left-6 border-4 border-white dark:border-slate-900 rounded-[2.2rem] shadow-xl overflow-hidden bg-slate-900">
          <Avatar
            src={profile.avatar_url}
            alt={profile.full_name}
            size="xl"
            isOnline={showOnline && profile.bio?.includes('online') /* mock online checks */}
          />
        </div>

        {/* User metadata */}
        <div className="text-left mt-2 pl-0 sm:pl-36 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
              {profile.full_name}
            </h2>
            {isOwnProfile && (
              <Badge variant="primary" size="sm">Athlete (You)</Badge>
            )}
            {isFriend && !isOwnProfile && (
              <Badge variant="success" size="sm">Connected Friend</Badge>
            )}
          </div>
          
          <p className="text-xs text-slate-400 font-bold mt-1.5">
            @{profile.username} | {profile.fitsync_id}
          </p>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 max-w-xl font-semibold leading-relaxed">
            {profile.bio || "No biography provided by this athlete."}
          </p>

          {/* Social details */}
          <div className="flex flex-col gap-1.5 mt-4 text-[10px] text-slate-400 font-bold">
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[1.25em]">location_on</span>
                <span>{profile.location}</span>
              </div>
            )}
            {profile.age && (isOwnProfile || !privacy?.hide_age) && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[1.25em]">cake</span>
                <span>{profile.age} years old</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[1.25em]">calendar_month</span>
              <span>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <SocialLinks 
            website={profile.website} 
            instagram={profile.instagram} 
            twitter={profile.twitter} 
            className="mt-4"
          />
        </div>

        {/* Action Controls */}
        <div className="w-full sm:w-auto flex flex-col gap-2">
          {isOwnProfile ? (
            <div className="flex gap-2">
              <Link to="/settings" className="flex-1 sm:flex-initial">
                <Button variant="secondary" className="w-full text-xs" leftIcon="edit">
                  Edit Profile
                </Button>
              </Link>
              {onRecalculate && (
                <Button 
                  onClick={onRecalculate} 
                  variant="secondary" 
                  className="text-xs" 
                  leftIcon="sync"
                  title="Recalculate Stats"
                />
              )}
            </div>
          ) : (
            !isFriend && onSendFriendRequest && (
              <Button 
                onClick={onSendFriendRequest} 
                variant="primary" 
                className="w-full text-xs" 
                leftIcon="person_add"
              >
                Send Friend Request
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
