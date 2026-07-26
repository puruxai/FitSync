// FitSync Component: FitnessCard
// Renders metric totals, goal percentages, material icons, and circular progress rings

import React from 'react';
import Card from '../ui/Card';
import ProgressRing from './ProgressRing';

interface FitnessCardProps {
  title: string;
  value: string | number;
  goalValue?: string | number;
  percentage: number;
  icon: string;
  colorTheme: 'green' | 'cyan' | 'violet' | 'orange' | 'rose' | 'amber';
  subtext?: string;
  onClick?: () => void;
}

export const FitnessCard: React.FC<FitnessCardProps> = ({
  title,
  value,
  goalValue,
  percentage,
  icon,
  colorTheme,
  subtext,
  onClick
}) => {
  const themes = {
    green: { text: 'text-emerald-500', stroke: 'stroke-emerald-550', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    cyan: { text: 'text-cyan-500', stroke: 'stroke-cyan-550', bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
    violet: { text: 'text-violet-500', stroke: 'stroke-violet-550', bg: 'bg-violet-50 dark:bg-violet-950/20' },
    orange: { text: 'text-orange-500', stroke: 'stroke-orange-550', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    rose: { text: 'text-rose-500', stroke: 'stroke-rose-550', bg: 'bg-rose-50 dark:bg-rose-950/20' },
    amber: { text: 'text-amber-505', stroke: 'stroke-amber-550', bg: 'bg-amber-50 dark:bg-amber-950/20' }
  };

  const theme = themes[colorTheme];

  return (
    <Card 
      variant="glass" 
      onClick={onClick}
      className={`p-5 flex items-center justify-between transition-all select-none ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
    >
      <div className="text-left space-y-1">
        <p className={`text-[10px] font-black uppercase tracking-wider ${theme.text}`}>
          {title}
        </p>
        <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-1">
          {value}
        </h3>
        {goalValue !== undefined ? (
          <p className="text-[10px] text-slate-400 font-bold">
            Goal: {goalValue}
          </p>
        ) : subtext ? (
          <p className="text-[10px] text-slate-405 dark:text-slate-450 font-bold">
            {subtext}
          </p>
        ) : null}
      </div>
      
      <div>
        <ProgressRing 
          percentage={percentage} 
          size={56} 
          strokeWidth={5} 
          color={theme.stroke} 
          icon={icon} 
        />
      </div>
    </Card>
  );
};

export default FitnessCard;
