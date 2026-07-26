// FitSync Component: InsightsGrid
// Displays averages and active hour summaries in grid layouts

import React from 'react';
import Card from '../ui/Card';
import type { UserStatsSummary } from '../../services/statistics';

interface InsightsGridProps {
  stats: UserStatsSummary;
}

export const InsightsGrid: React.FC<InsightsGridProps> = ({ stats }) => {
  const cards = [
    { label: 'Most Active Day', val: stats.best_workout_day, desc: 'Highest calorie burns logged', icon: 'calendar_month', color: 'text-brand-500' },
    { label: 'Peak Training Hour', val: stats.most_active_time, desc: 'Preferred session start', icon: 'schedule', color: 'text-indigo-500' },
    { label: 'Average Daily Steps', val: `${stats.average_steps.toLocaleString()} steps`, desc: 'Average walking target', icon: 'footprint', color: 'text-emerald-500' },
    { label: 'Consistency Rating', val: `${stats.consistency_score}%`, desc: 'Routine adherence index', icon: 'checklist', color: 'text-pink-500' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left select-none">
      {cards.map((c, idx) => (
        <Card 
          key={idx} 
          variant="glass" 
          className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex flex-col justify-between min-h-36"
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-[9px] font-black uppercase text-slate-400">{c.label}</span>
            <span className={`material-symbols-outlined text-[1.4em] ${c.color}`}>{c.icon}</span>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
              {c.val}
            </h4>
            <p className="text-[9px] text-slate-400 mt-1 font-semibold leading-relaxed">
              {c.desc}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InsightsGrid;
