// FitSync Hook: usePrivacySettings
// Handles loading and saving of health data and analytics tracking privacy consents

import { useState, useEffect, useCallback } from 'react';
import { PrivacyService } from '../services/security/privacy';

export const usePrivacySettings = (userId: string) => {
  const [cookiesAllowed, setCookiesAllowed] = useState(false);
  const [healthAllowed, setHealthAllowed] = useState(false);

  useEffect(() => {
    if (!userId) return;

    PrivacyService.checkConsent(userId, 'cookies_marketing').then(setCookiesAllowed);
    PrivacyService.checkConsent(userId, 'health_metrics_analysis').then(setHealthAllowed);
  }, [userId]);

  const updateConsent = useCallback(async (type: 'cookies_marketing' | 'health_metrics_analysis', given: boolean) => {
    if (!userId) return;

    await PrivacyService.recordConsent(userId, type, given);
    if (type === 'cookies_marketing') {
      setCookiesAllowed(given);
    } else {
      setHealthAllowed(given);
    }
  }, [userId]);

  return {
    cookiesAllowed,
    healthAllowed,
    updateConsent
  };
};

export default usePrivacySettings;
