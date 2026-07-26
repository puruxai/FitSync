// FitSync Hook: useAnalytics
// Provides methods to log telemetry clicks, navigation pages, and queries to backend channels

import { useCallback } from 'react';
import { AnalyticsService } from '../services/analytics';

export const useAnalytics = (userId?: string) => {
  const logEvent = useCallback(async (eventType: string, details?: any) => {
    if (!userId) return;
    try {
      await AnalyticsService.logEvent(userId, eventType, details);
    } catch (err) {
      console.error('Failed to log analytics event:', err);
    }
  }, [userId]);

  const trackPageView = useCallback(async (pageName: string) => {
    await logEvent('page_view', { page: pageName });
  }, [logEvent]);

  return {
    logEvent,
    trackPageView
  };
};

export default useAnalytics;
