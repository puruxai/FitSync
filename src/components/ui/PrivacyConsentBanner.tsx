// FitSync Component: PrivacyConsentBanner
// Displays GDPR & CCPA cookie and health metrics consent banner with glassmorphism layout

import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { PrivacyService } from '../../services/security/privacy';

interface Props {
  userId: string;
}

export const PrivacyConsentBanner: React.FC<Props> = ({ userId }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Show banner if marketing cookies has not been decided yet
    PrivacyService.checkConsent(userId, 'cookies_marketing').then((allowed) => {
      if (!allowed) {
        setVisible(true);
      }
    });
  }, [userId]);

  const handleAcceptAll = async () => {
    if (!userId) return;
    await PrivacyService.recordConsent(userId, 'cookies_marketing', true);
    await PrivacyService.recordConsent(userId, 'health_metrics_analysis', true);
    setVisible(false);
  };

  const handleDecline = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-50 animate-bounce-in">
      <Card variant="glass" className="p-6 border border-brand-500/25 dark:border-brand-400/25 shadow-2xl rounded-3xl space-y-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-3xl text-brand-500 bg-brand-500/10 p-2 rounded-2xl">
            cookie
          </span>
          <div className="space-y-1 text-left">
            <h4 className="text-xs font-black dark:text-white leading-tight">Privacy & Consent preferences</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              FitSync collects cookie metrics and health stats processing consent under GDPR Guidelines.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleDecline}
            className="text-[10px] px-3 py-1.5 font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            Decline
          </button>
          <Button size="sm" onClick={handleAcceptAll}>
            Accept All
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyConsentBanner;
