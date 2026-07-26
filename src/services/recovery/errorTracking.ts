// FitSync Error Tracking & Integration Abstraction Service
// Implements interface mappings for future Sentry, Rollbar, and Bugsnag integrations

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ThirdPartyErrorProvider {
  name: string;
  captureException: (error: Error, severity: ErrorSeverity) => void;
}

// Global active third-party provider list
const activeProviders: ThirdPartyErrorProvider[] = [
  {
    name: 'ConsoleLogger',
    captureException: (err, sev) => {
      console.warn(`[3rd Party ${sev.toUpperCase()}] Captured exception: ${err.message}`);
    }
  }
];

export const ErrorTrackingService = {
  /**
   * Log exception to database and dispatch to registered providers
   */
  async reportError(error: Error, severity: ErrorSeverity = 'medium', componentName?: string): Promise<void> {
    const payload = {
      message: error.message,
      severity,
      component_name: componentName || 'UnknownComponent',
      route_path: typeof window !== 'undefined' ? window.location.pathname : '/',
      stack_trace: error.stack || ''
    };

    // 1. Dispatch to third-party integrations (Sentry etc)
    activeProviders.forEach((prov) => {
      try {
        prov.captureException(error, severity);
      } catch (err) {
        console.error(`Failed to dispatch error to provider ${prov.name}`, err);
      }
    });

    // 2. Persist to database
    try {
      if (isSupabaseConfigured) {
        await supabase.from('error_reports').insert(payload);
      } else {
        const reports = getFromMockDb<any>('error_reports');
        reports.push({
          id: 'rep-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('error_reports', reports);
      }
    } catch {
      // Avoid recursive crash
    }
  },

  /**
   * Log app rendering crash
   */
  async reportCrash(errorMessage: string, stack?: string): Promise<void> {
    const payload = {
      error_message: errorMessage,
      stack_trace: stack || '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('crash_reports').insert(payload);
      } else {
        const crashes = getFromMockDb<any>('crash_reports');
        crashes.push({
          id: 'crs-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('crash_reports', crashes);
      }
    } catch {
      // Avoid crash on save
    }
  }
};
export default ErrorTrackingService;
