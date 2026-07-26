// FitSync Component: EmptyState
// Displays beautiful empty state illustrations and actions for dashboards

import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description
}) => {
  return (
    <div className="py-20 text-center text-slate-400 select-none">
      <span className="material-symbols-outlined text-5xl mb-4 text-slate-350 dark:text-slate-700 animate-bounce">
        {icon}
      </span>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </p>
      <p className="text-xs mt-1 text-slate-400 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
