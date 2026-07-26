// FitSync Component: ChallengeProgressCard
// Renders circular progress rings showing goal progress and predicted challenge winners

import React from 'react';
import Card from '../ui/Card';

interface ChallengeProgressCardProps {
  progressValue: number;
  goalValue: number;
  percent: number;
  unit: string;
  predictedWinner: string;
}

export const ChallengeProgressCard: React.FC<ChallengeProgressCardProps> = ({
  progressValue,
  goalValue,
  percent,
  unit,
  predictedWinner
}) => {
  const radius = 45;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left flex flex-col sm:flex-row items-center gap-6 select-none bg-gradient-to-r from-brand-500/5 to-violet-500/5">
      {/* Circle percent ring */}
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-95 overflow-visible">
          <circle
            stroke="rgba(148, 163, 184, 0.1)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="url(#progressGrad)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-sm font-black text-slate-850 dark:text-white">
          {percent}%
        </span>
      </div>

      <div className="flex-1 space-y-4">
        {/* Progress summary values */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Your Progress</span>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-150 mt-0.5">
              {(progressValue ?? 0).toLocaleString()} / {(goalValue ?? 0).toLocaleString()}
            </h4>
            <p className="text-[9px] text-slate-400 font-semibold">{unit}</p>
          </div>
          
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Winner Prediction</span>
            <h4 className="text-sm font-black text-brand-600 dark:text-brand-400 mt-0.5 flex items-center gap-1 leading-tight">
              <span className="material-symbols-outlined text-xs">emoji_events</span>
              {predictedWinner}
            </h4>
            <p className="text-[9px] text-slate-400 font-semibold">Highest current progress</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChallengeProgressCard;
