// FitSync Component: Avatar
// A reusable profile photo circle with status ring and size presets

import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Athlete',
  size = 'md',
  isOnline = false,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs rounded-xl',
    md: 'w-16 h-16 text-sm rounded-2xl',
    lg: 'w-24 h-24 text-base rounded-3xl',
    xl: 'w-32 h-32 text-lg rounded-[2rem]'
  };

  const statusClasses = {
    sm: 'w-3 h-3 border-2',
    md: 'w-3.5 h-3.5 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-4'
  };

  const fallbackInitial = alt.trim() ? alt.trim().charAt(0).toUpperCase() : 'A';

  return (
    <div 
      className={`relative inline-block select-none ${onClick ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${sizeClasses[size]} object-cover border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-900`}
        />
      ) : (
        <div className={`${sizeClasses[size]} flex items-center justify-center font-black text-white bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md`}>
          {fallbackInitial}
        </div>
      )}
      
      {isOnline && (
        <span 
          className={`absolute bottom-0 right-0 ${statusClasses[size]} bg-emerald-500 border-white dark:border-slate-950 rounded-full animate-pulse shadow-sm`}
          title="Online status"
        />
      )}
    </div>
  );
};

export default Avatar;
