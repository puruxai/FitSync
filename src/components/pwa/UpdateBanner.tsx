// FitSync Component: UpdateBanner
// Renders action triggers notifying users that a new version of the app is available

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface UpdateBannerProps {
  isUpdateAvailable: boolean;
  onUpdate: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  isUpdateAvailable,
  onUpdate
}) => {
  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-55 w-80 select-none">
      <Card variant="glass" className="p-4 border border-emerald-500/30 rounded-3xl space-y-3 text-left">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-500 text-3xl bg-emerald-500/10 p-2 rounded-2xl">
            update
          </span>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">New Update Available!</h4>
            <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
              We have launched newer optimization configurations. Reload to get them.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={onUpdate} leftIcon="refresh">
            Reload Now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UpdateBanner;
