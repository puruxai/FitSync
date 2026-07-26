import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const baseStyles = 'rounded-3xl p-6 transition-all duration-300 overflow-hidden';
  
  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 shadow-sm shadow-slate-100 dark:shadow-none',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/30 shadow-lg shadow-slate-100/30 dark:shadow-none',
    outline: 'border border-slate-200 dark:border-slate-800 bg-transparent',
    gradient: 'bg-gradient-to-tr from-slate-900 via-slate-800 to-brand-950 text-white border border-slate-800 shadow-xl'
  };

  const hoverStyle = hoverEffect 
    ? 'hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-700/80'
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
