// FitSync Component: OfflineBanner
// Floating connectivity toast alerts warning users of offline statuses

import React from 'react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-55 w-[calc(100%-2rem)] max-w-sm select-none animate-bounce">
      <div className="bg-red-500 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[1.3em]">
            wifi_off
          </span>
          <span>Offline state. Modifications will synchronize later.</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
