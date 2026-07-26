// FitSync Component: NotificationBadge
// Renders active counts circles on top of notification bells

import React from 'react';

interface NotificationBadgeProps {
  unreadCount: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ unreadCount }) => {
  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse select-none">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default NotificationBadge;
