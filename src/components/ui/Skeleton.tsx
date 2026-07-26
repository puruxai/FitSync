import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect'
}) => {
  const base = 'animate-pulse bg-slate-200 dark:bg-slate-800';
  
  const variants = {
    text: 'h-4 w-3/4 rounded',
    rect: 'rounded-2xl',
    circle: 'rounded-full'
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} />
  );
};
export default Skeleton;
