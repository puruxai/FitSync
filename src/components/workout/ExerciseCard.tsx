// FitSync Component: ExerciseCard
// Renders active exercise steps, sets count, targets muscles, and instructions

import React from 'react';
import Card from '../ui/Card';
import type { Exercise } from '../../services/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index }) => {
  return (
    <Card variant="glass" className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none flex gap-4">
      {/* Exercise animation/image placeholder */}
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={exercise.animation_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'}
          alt={exercise.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h4 className="text-xs font-bold text-slate-855 dark:text-white leading-tight">
              {index + 1}. {exercise.name}
            </h4>
            <span className="text-[8px] font-black uppercase text-slate-400 mt-1 block">
              Target: {exercise.target_muscle || 'cardio'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 block">
              {exercise.sets} Sets
            </span>
            <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
              {exercise.reps ? `${exercise.reps} Reps` : `${exercise.duration}s hold`}
            </span>
          </div>
        </div>

        {/* Instructions list */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <ul className="mt-2.5 space-y-1 pl-3.5 list-disc text-[9px] text-slate-400 font-semibold leading-relaxed">
            {exercise.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default ExerciseCard;
