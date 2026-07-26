// FitSync Security Hardening Service
// Implements client-side input sanitization against XSS, brute-force logs, and intrusion audits

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export const SecurityHardeningService = {
  /**
   * Basic XSS input sanitization escaping script tag blocks
   */
  sanitizeInput(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Log brute force attempt
   */
  async logLoginAttempt(email: string, status: 'success' | 'failed', ipAddress = '127.0.0.1'): Promise<void> {
    const payload = {
      email,
      ip_address: ipAddress,
      attempt_status: status
    };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('login_attempts').insert(payload);
      } else {
        const attempts = getFromMockDb<any>('login_attempts');
        attempts.push({
          id: 'lat-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('login_attempts', attempts);
      }
    } catch {
      // avoid crash
    }
  },

  /**
   * Log privilege violation attempts
   */
  async logSecurityEvent(eventType: string, userId?: string, details?: string): Promise<void> {
    const payload = {
      event_type: eventType,
      user_id: userId || null,
      details: details || '',
      severity: 'high' as const
    };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('security_events').insert(payload);
      } else {
        const events = getFromMockDb<any>('security_events');
        events.push({
          id: 'sev-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('security_events', events);
      }
    } catch {
      // avoid crash
    }
  }
};
export default SecurityHardeningService;
