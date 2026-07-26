// FitSync Error Tracking Service
// Captures unhandled promise rejections and script exceptions for dashboard analysis

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface ErrorEventLog {
  id?: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  user_id?: string;
  created_at?: string;
}

export const ErrorTrackerService = {
  /**
   * Capture and log error event
   */
  async captureException(error: Error, userId?: string): Promise<void> {
    const payload = {
      error_type: error.name || 'Error',
      message: error.message,
      stack_trace: error.stack || '',
      user_id: userId || null
    };

    console.error(`[Error Tracker] Caught Exception: ${error.message}`, error);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('error_events').insert(payload);
      } else {
        const events = getFromMockDb<any>('error_events');
        events.push({
          id: 'err-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('error_events', events);
      }
    } catch {
      // Avoid crash on error push
    }
  },

  /**
   * Listen to global browser exceptions
   */
  registerGlobalListeners(userId?: string): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), userId);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.captureException(error, userId);
    });
  },

  /**
   * Fetch recent errors logs
   */
  async getRecentErrors(): Promise<ErrorEventLog[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('error_events').select('*').order('created_at', { ascending: false }).limit(20);
      return data || [];
    } else {
      return getFromMockDb<ErrorEventLog>('error_events').slice(-20);
    }
  }
};
export default ErrorTrackerService;
