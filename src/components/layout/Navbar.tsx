import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRealtime } from '../../contexts/RealtimeContext';

export const Navbar: React.FC = () => {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsRead, isNetworkOnline } = useRealtime();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.is_read);

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    setShowNotifications(false);
    navigate('/notifications');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-brand-600 dark:text-brand-500 text-3xl font-bold">fit_screen</span>
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">FitSync</span>
          </Link>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3">
          {/* Realtime Status Indicator Badge */}
          {profile && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider select-none transition-all ${isNetworkOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <span className={`w-2 h-2 rounded-full ${isNetworkOnline ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
              <span>{isNetworkOnline ? 'Live' : 'Offline'}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {profile && (
            <>
              {/* Notification Widget */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-2 right-2.5 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Recent Notifications</h4>
                      <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-brand-600 hover:text-brand-500">
                        View All
                      </Link>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id)}
                            className={`p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${!n.is_read ? 'bg-brand-50/30 dark:bg-brand-950/10' : ''}`}
                          >
                            <div className="flex gap-2.5">
                              <span className="material-symbols-outlined text-brand-500 text-lg">
                                {n.type === 'friend_request' ? 'group_add' : n.type === 'challenge_invite' ? 'sports_esports' : n.type === 'achievement' ? 'military_tech' : 'notifications'}
                              </span>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{n.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.content}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <img
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <span className="hidden md:inline text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">
                    {profile.full_name.split(' ')[0]}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden z-50 py-2">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/40">
                      <p className="text-sm font-bold text-slate-950 dark:text-white truncate">{profile.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{profile.username}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">account_circle</span>
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">settings</span>
                      <span>Settings</span>
                    </Link>
                    <hr className="border-slate-100 dark:border-slate-800/40 my-1" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout().then(() => navigate('/login'));
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!profile && (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-4 py-2">
                Login
              </Link>
              <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-md shadow-brand-500/10">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
