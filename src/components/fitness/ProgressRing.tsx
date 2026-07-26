// FitSync Component: ProgressRing
// A premium SVG circular progress ring visualizing metric percentage completions

import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trailColor?: string;
  icon?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 64,
  strokeWidth = 6,
  color = 'stroke-brand-550',
  trailColor = 'stroke-slate-100 dark:stroke-slate-850',
  icon
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track circle */}
        <circle
          className={`${trailColor} transition-all`}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground completion circle */}
        <circle
          className={`${color} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {icon ? (
        <span className="material-symbols-outlined text-[1.4em] absolute text-slate-700 dark:text-slate-350">
          {icon}
        </span>
      ) : (
        <span className="text-[10px] font-black absolute text-slate-800 dark:text-slate-200">
          {Math.round(clampedPercentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressRing;
