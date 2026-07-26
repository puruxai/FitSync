import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const items = [
    { name: 'Home', path: '/dashboard', icon: 'dashboard' },
    { name: 'Fitness', path: '/fitness', icon: 'fitness_center' },
    { name: 'AI Coach', path: '/ai', icon: 'psychology' },
    { name: 'Challenges', path: '/challenges', icon: 'emoji_events' },
    { name: 'Profile', path: '/profile', icon: 'account_circle' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 px-2 py-1.5 shadow-xl transition-all duration-300">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-brand-600 dark:text-brand-400 scale-105' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`
            }
          >
            <span className="material-symbols-outlined text-[1.55em]">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
export default BottomNav;
