// FitSync Component: StorageUsageCard
// Renders active disk storage capacities metrics (quota vs usage MB dials)

import React from 'react';
import Card from '../ui/Card';

interface StorageUsageCardProps {
  bytesUsed: number;
  quotaBytes: number;
  loading?: boolean;
}

export const StorageUsageCard: React.FC<StorageUsageCardProps> = ({
  bytesUsed,
  quotaBytes,
  loading = false
}) => {
  const usedMB = (bytesUsed / (1024 * 1024)).toFixed(1);
  const quotaMB = (quotaBytes / (1024 * 1024)).toFixed(0);
  const percent = Math.min(Math.round((bytesUsed / quotaBytes) * 100), 100);

  return (
    <Card variant="glass" className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black uppercase text-slate-400">Disk Quota Allocation</h4>
          <span className="text-[8px] text-slate-450 block font-bold">Total space utilized across file uploads</span>
        </div>
        <span className="material-symbols-outlined text-brand-500 text-xl">
          donut_large
        </span>
      </div>

      {loading ? (
        <div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-black text-slate-900 dark:text-white">
            <span>{usedMB} MB used</span>
            <span>{quotaMB} MB limit</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <span className="text-[8px] text-slate-400 font-bold block">
            {percent}% capacity occupied
          </span>
        </div>
      )}
    </Card>
  );
};

export default StorageUsageCard;
