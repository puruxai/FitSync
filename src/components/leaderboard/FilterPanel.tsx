// FitSync Component: FilterPanel
// Displays category selection cards, period selectors, and demographic filters

import React from 'react';
import Card from '../ui/Card';
import type { LeaderboardFilters } from '../../services/leaderboard';

interface FilterPanelProps {
  filters: LeaderboardFilters;
  onFilterChange: (filters: Partial<LeaderboardFilters>) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange
}) => {
  const categories: { value: LeaderboardFilters['category']; label: string; icon: string }[] = [
    { value: 'steps', label: 'Steps Logged', icon: 'directions_walk' },
    { value: 'calories', label: 'Calories Burned', icon: 'local_fire_department' },
    { value: 'workout_minutes', label: 'Active Workout', icon: 'fitness_center' },
    { value: 'water', label: 'Water Drank', icon: 'local_drink' },
    { value: 'weight_loss', label: 'Weight Loss', icon: 'monitoring' },
    { value: 'workout_streak', label: 'Workouts Streak', icon: 'bolt' },
    { value: 'activity_score', label: 'Activity Score', icon: 'grade' }
  ];

  return (
    <div className="space-y-6">
      {/* Category selector slider */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
        {categories.map(c => {
          const isActive = filters.category === c.value;
          return (
            <button
              key={c.value}
              onClick={() => onFilterChange({ category: c.value })}
              className={`px-4 py-3 rounded-2xl flex items-center gap-2 border text-xs font-black capitalize whitespace-nowrap transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/40 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[1.3em]">{c.icon}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      <Card variant="glass" className="p-4 sm:p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {/* 1. Scope and Period */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Period</label>
            <select
              value={filters.period}
              onChange={(e) => onFilterChange({ period: e.target.value as any })}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="all_time">All-Time</option>
            </select>
          </div>

          {/* 2. Demographic: Gender */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gender</label>
            <select
              value={filters.gender || ''}
              onChange={(e) => onFilterChange({ gender: e.target.value || undefined })}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* 3. Demographic: Age Group */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Age Group</label>
            <select
              value={filters.ageGroup || ''}
              onChange={(e) => onFilterChange({ ageGroup: (e.target.value || undefined) as any })}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
            >
              <option value="">All Ages</option>
              <option value="under_20">Under 20</option>
              <option value="20_29">20 to 29</option>
              <option value="30_39">30 to 39</option>
              <option value="40_49">40 to 49</option>
              <option value="50_plus">50+</option>
            </select>
          </div>

          {/* 4. Demographic: Goals */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Location (City/Country)</label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => onFilterChange({ location: e.target.value || undefined })}
              placeholder="e.g. London, USA"
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white placeholder-slate-400"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FilterPanel;
