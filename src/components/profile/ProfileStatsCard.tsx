// FitSync Component: ProfileStatsCard
// Renders a glassmorphism statistics container, supporting locked visibility for private metrics

import React from 'react';
import Card from '../ui/Card';

interface ProfileStatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  iconColor?: string;
  showValue?: boolean;
}

export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  title,
  value,
  subtext,
  icon,
  iconColor = 'text-brand-500',
  showValue = true
}) => {
  return (
    <Card variant="glass" className="p-5 text-left flex flex-col justify-between h-full">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{title}</p>
        
        {showValue ? (
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
            <span>{value}</span>
            {icon && (
              <span className={`material-symbols-outlined text-[0.85em] ${iconColor}`}>{icon}</span>
            )}
          </h3>
        ) : (
          <h3 className="text-base font-bold text-slate-400 dark:text-slate-500 mt-2.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1.1em]">lock</span>
            <span>Private</span>
          </h3>
        )}
      </div>
      
      {subtext && (
        <p className="text-[9px] text-slate-405 dark:text-slate-450 mt-1 font-semibold leading-normal">{subtext}</p>
      )}
    </Card>
  );
};

export default ProfileStatsCard;
