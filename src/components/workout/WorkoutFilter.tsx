// FitSync Component: WorkoutFilter
// Renders lists of categories, difficulties, and equipment toggles to search workflows

import React from 'react';

interface WorkoutFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (diff: string) => void;
}

export const WorkoutFilter: React.FC<WorkoutFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty
}) => {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'home', label: 'Home Workout' },
    { value: 'gym', label: 'Gym Workout' },
    { value: 'hiit', label: 'HIIT Cardio' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'strength', label: 'Strength Training' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left select-none">
      {/* Category Select */}
      <div className="space-y-1">
        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Workout Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Difficulty Select */}
      <div className="space-y-1">
        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Difficulty Level</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => onSelectDifficulty(e.target.value)}
          className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
        >
          {difficulties.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default WorkoutFilter;
