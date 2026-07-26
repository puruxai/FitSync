// FitSync Component: AchievementCard
// Renders platform badges with locked/unlocked visual feedback and details

import React from 'react';

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  color?: string;
  unlocked?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  icon,
  color = 'bg-brand-500 text-white',
  unlocked = false
}) => {
  return (
    <div 
      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
        unlocked 
          ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800' 
          : 'bg-slate-100/50 dark:bg-slate-900/10 border-transparent opacity-50'
      }`}
    >
      <span className={`material-symbols-outlined p-2 rounded-xl text-xl ${
        unlocked ? color : 'bg-slate-200 dark:bg-slate-800 text-slate-450 dark:text-slate-550'
      }`}>
        {icon}
      </span>
      
      <div className="min-w-0 text-left">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{title}</h4>
        <p className="text-[9px] text-slate-400 font-semibold leading-normal mt-0.5">{description}</p>
      </div>
    </div>
  );
};

export default AchievementCard;
