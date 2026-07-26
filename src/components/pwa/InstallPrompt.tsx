// FitSync Component: InstallPrompt
// Material design banner offering standalone PWA app downloads

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface InstallPromptProps {
  isInstallable: boolean;
  onInstall: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  isInstallable,
  onInstall
}) => {
  if (!isInstallable) return null;

  return (
    <div className="fixed top-20 right-4 z-55 w-80 select-none animate-slide-in">
      <Card variant="glass" className="p-4 border border-brand-500/30 rounded-3xl space-y-3 text-left">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-brand-500 text-3xl bg-brand-500/10 p-2 rounded-2xl">
            download_for_offline
          </span>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Install FitSync Desktop</h4>
            <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
              Install our standalone version for offline tracking and notifications.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={onInstall} leftIcon="download">
            Install App
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InstallPrompt;
