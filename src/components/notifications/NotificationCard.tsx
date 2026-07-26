// FitSync Component: NotificationCard
// Renders individual notification items with priority tags, pin/archive buttons, and category icons

import React from 'react';
import Card from '../ui/Card';
import type { FitNotification } from '../../services/notification';

interface NotificationCardProps {
  notification: FitNotification;
  onRead: (id: string) => Promise<void>;
  onPin: (id: string, isPinned: boolean) => Promise<void>;
  onArchive: (id: string, isArchived: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRead,
  onPin,
  onArchive,
  onDelete,
  loading = false
}) => {
  // Category icon mapping
  const categoryIcons = {
    friend: { icon: 'group_add', color: 'text-brand-500 bg-brand-500/10' },
    challenge: { icon: 'sports_events', color: 'text-amber-500 bg-amber-500/10' },
    workout: { icon: 'fitness_center', color: 'text-indigo-500 bg-indigo-500/10' },
    reminder: { icon: 'alarm', color: 'text-violet-500 bg-violet-500/10' },
    leaderboard: { icon: 'leaderboard', color: 'text-orange-500 bg-orange-500/10' },
    achievement: { icon: 'military_tech', color: 'text-emerald-500 bg-emerald-500/10' },
    system: { icon: 'info', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' }
  };

  const config = categoryIcons[notification.category] || categoryIcons.system;

  // Priority indicator styles
  const prioColors = {
    low: 'bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400',
    medium: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    high: 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
  };

  const handleCardClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
  };

  return (
    <Card 
      variant="glass" 
      onClick={handleCardClick}
      className={`p-4 flex items-start justify-between gap-4 border transition-all select-none ${
        !notification.is_read 
          ? 'border-brand-500/20 bg-brand-500/[0.02] hover:bg-brand-500/[0.04]' 
          : 'border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-850/10'
      }`}
    >
      <div className="flex gap-3.5 text-left flex-1 min-w-0">
        {/* Category Icon and Priority Ring */}
        <span className={`material-symbols-outlined text-2xl p-2.5 rounded-2xl flex-shrink-0 ${config.color}`}>
          {config.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-black text-slate-850 dark:text-white leading-tight truncate">
              {notification.title}
            </h4>
            
            {/* Priority tag */}
            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${prioColors[notification.priority]}`}>
              {notification.priority}
            </span>

            {/* Unread marker */}
            {!notification.is_read && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            )}
          </div>

          <p className="text-[10px] text-slate-405 dark:text-slate-400 font-semibold mt-1 leading-relaxed line-clamp-2">
            {notification.message}
          </p>

          <span className="text-[8px] text-slate-400 font-bold block mt-2">
            {new Date(notification.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Pin */}
        <button
          onClick={() => onPin(notification.id, !notification.is_pinned)}
          disabled={loading}
          className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors ${notification.is_pinned ? 'text-brand-500' : 'text-slate-400'}`}
          title={notification.is_pinned ? 'Unpin' : 'Pin'}
        >
          <span className="material-symbols-outlined text-[1.1em]">
            {notification.is_pinned ? 'push_pin' : 'keep_pin'}
          </span>
        </button>

        {/* Archive */}
        <button
          onClick={() => onArchive(notification.id, !notification.is_archived)}
          disabled={loading}
          className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors ${notification.is_archived ? 'text-violet-500' : 'text-slate-400'}`}
          title={notification.is_archived ? 'Move to Inbox' : 'Archive'}
        >
          <span className="material-symbols-outlined text-[1.1em]">
            {notification.is_archived ? 'unarchive' : 'archive'}
          </span>
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(notification.id)}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
          title="Delete"
        >
          <span className="material-symbols-outlined text-[1.1em]">
            delete
          </span>
        </button>
      </div>
    </Card>
  );
};

export default NotificationCard;
