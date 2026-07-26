// FitSync Audit Service
// Records login events, role additions, profile exports, and data modifications

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export const AuditService = {
  /**
   * Log action to audit trail
   */
  async logAction(userId: string, action: string, details?: string, ipAddress?: string): Promise<void> {
    const payload = {
      user_id: userId,
      action,
      details: details || null,
      ip_address: ipAddress || '127.0.0.1'
    };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('audit_logs').insert(payload);
      } else {
        const list = getFromMockDb<any>('audit_logs');
        list.push({
          id: 'aud-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('audit_logs', list);
      }
    } catch {
      // Avoid crash on audit save
    }
  }
};
export default AuditService;
