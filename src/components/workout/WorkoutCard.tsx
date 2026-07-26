// FitSync Component: WorkoutCard
// Displays cover thumbnail image, goal, duration, calories estimation, and favorite status triggers

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Workout } from '../../services/workout';

interface WorkoutCardProps {
  workout: Workout;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => Promise<void>;
  onSelect: (workout: Workout) => void;
  loading?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  isFavorite,
  onToggleFavorite,
  onSelect,
  loading = false
}) => {
  const [saving, setSaving] = React.useState(false);

  const handleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSaving(true);
      await onToggleFavorite(workout.id);
    } catch {} finally {
      setSaving(false);
    }
  };

  // Difficulty pill tags
  const diffColors = {
    beginner: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    advanced: 'bg-red-500/10 text-red-500 border border-red-500/20'
  };

  return (
    <Card 
      variant="glass" 
      onClick={() => onSelect(workout)}
      className="overflow-hidden flex flex-col justify-between text-left h-full border border-slate-200/50 dark:border-slate-800/40 rounded-3xl hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
    >
      <div>
        {/* Cover banner */}
        <div className="h-36 w-full relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <img
            src={workout.cover_image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'}
            alt={workout.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Favorite button */}
          <button
            onClick={handleFav}
            disabled={saving || loading}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
          >
            <span className={`material-symbols-outlined text-lg ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`}>
              favorite
            </span>
          </button>

          <span className={`absolute top-3 left-3 px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${diffColors[workout.difficulty]}`}>
            {workout.difficulty}
          </span>
        </div>

        {/* Content details */}
        <div className="p-4 sm:p-5">
          <span className="text-[8px] font-black uppercase text-brand-500 tracking-wider">
            {workout.category.replace('_', ' ')}
          </span>
          <h3 className="text-sm font-black text-slate-850 dark:text-white leading-tight mt-1 line-clamp-1">
            {workout.title}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1 line-clamp-2">
            {workout.description || 'No description provided.'}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-4 border-t border-slate-100 dark:border-slate-800/30 pt-4">
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Duration</span>
              <p className="text-xs font-black text-slate-800 dark:text-slate-150 mt-0.5">
                {workout.duration} mins
              </p>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Est. Calories</span>
              <p className="text-xs font-black text-slate-800 dark:text-slate-150 mt-0.5">
                ~{workout.calories} kcal
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <Button
          size="sm"
          className="w-full mt-2"
          onClick={() => onSelect(workout)}
        >
          View Exercises
        </Button>
      </div>
    </Card>
  );
};

export default WorkoutCard;
