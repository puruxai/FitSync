// FitSync Component: FitnessScoreDial
// Displays calculated overall Fitness Score in glassmorphic rings with status labels

import React from 'react';
import Card from '../ui/Card';

interface FitnessScoreDialProps {
  score: number;
  loading?: boolean;
}

export const FitnessScoreDial: React.FC<FitnessScoreDialProps> = ({
  score,
  loading = false
}) => {
  const rating = score >= 90 
    ? { text: 'Elite Fitness', color: 'text-emerald-500 bg-emerald-500/10' }
    : score >= 75
    ? { text: 'Active & Fit', color: 'text-brand-500 bg-brand-500/10' }
    : score >= 50
    ? { text: 'Moderate State', color: 'text-indigo-500 bg-indigo-500/10' }
    : { text: 'Developing State', color: 'text-red-500 bg-red-500/10' };

  const circumference = 2 * Math.PI * 52; // r=52
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card variant="glass" className="p-6 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex flex-col items-center justify-between text-center select-none min-h-60">
      <div className="space-y-1 w-full text-left">
        <h4 className="text-[10px] font-black uppercase text-slate-400">Calculated Fitness Score</h4>
        <span className="text-[8px] text-slate-400 block font-bold">Consolidates workouts, steps, water & consistency indices</span>
      </div>

      {loading ? (
        <div className="w-28 h-28 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-pulse my-4" />
      ) : (
        <div className="relative w-32 h-32 flex items-center justify-center my-3">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="52" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="8" fill="transparent" />
            <circle 
              cx="64" 
              cy="64" 
              r="52" 
              stroke="currentColor" 
              className="text-brand-500" 
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{score}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-1">/ 100</span>
          </div>
        </div>
      )}

      <p className={`text-[10px] font-black px-3 py-1 rounded-full ${rating.color}`}>
        {rating.text}
      </p>
    </Card>
  );
};

export default FitnessScoreDial;
