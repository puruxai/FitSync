import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoles } from '../../hooks/useRoles';
import { useTranslation } from '../../hooks/useTranslation';

interface SidebarItem {
  name: string;
  path: string;
  icon: string;
}

export const Sidebar: React.FC = () => {
  const { profile } = useAuth();
  const { isAdmin } = useRoles(profile?.id);
  const { t } = useTranslation();

  if (!profile) return null;

  const items: SidebarItem[] = [
    { name: t('dashboard'), path: '/dashboard', icon: 'dashboard' },
    { name: t('fitness'), path: '/fitness', icon: 'fitness_center' },
    { name: t('friends'), path: '/friends', icon: 'group' },
    { name: t('leaderboard'), path: '/leaderboard', icon: 'leaderboard' },
    { name: t('challenges'), path: '/challenges', icon: 'emoji_events' },
    { name: t('workouts'), path: '/workouts', icon: 'menu_book' },
    { name: t('ai'), path: '/ai', icon: 'psychology' },
    { name: t('analytics'), path: '/analytics', icon: 'analytics' },
    { name: t('media'), path: '/media', icon: 'perm_media' },
    ...(isAdmin ? [{ name: t('control_console'), path: '/admin', icon: 'admin_panel_settings' }] : []),
    { name: t('settings'), path: '/settings', icon: 'settings' }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/40 h-[calc(100vh-4rem)] sticky top-16 p-4 justify-between transition-colors duration-300">
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/20'
              }`
            }
          >
            <span className="material-symbols-outlined text-[1.35em]">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Mini Profile Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/30 rounded-3xl flex items-center gap-3">
        <img
          src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
          alt={profile.full_name}
          className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{profile.full_name}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">FitSync ID: {profile.fitsync_id}</p>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
