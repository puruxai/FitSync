// FitSync Audit Trails Log Service
// Records system administration changes, bans, roles assignments, and exports logs history

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
  user_name?: string;
}

export const AuditService = {
  /**
   * Write an audit log entry
   */
  async logAction(userId: string, action: string, details?: string, ip?: string): Promise<void> {
    const payload = {
      user_id: userId,
      action,
      details: details || '',
      ip_address: ip || '127.0.0.1'
    };

    if (isSupabaseConfigured) {
      await supabase.from('audit_logs').insert(payload);
    } else {
      const logs = getFromMockDb<AuditLog>('audit_logs');
      logs.push({
        id: 'aud-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      });
      saveToMockDb('audit_logs', logs);
    }
  },

  /**
   * Get audit logs list
   */
  async getLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any[]).map(d => ({
        ...d,
        user_name: d.profiles?.full_name || 'Admin User'
      })) as unknown as AuditLog[];
    } else {
      const logs = getFromMockDb<AuditLog>('audit_logs');
      if (logs.length === 0) {
        // Seed default log
        const defaultLog: AuditLog = {
          id: 'aud-seed',
          user_id: 'usr-admin',
          action: 'role_assignment',
          details: 'Assigned Trainer role to user u-1',
          ip_address: '192.168.1.1',
          created_at: new Date().toISOString(),
          user_name: 'System Admin'
        };
        logs.push(defaultLog);
        saveToMockDb('audit_logs', logs);
        return [defaultLog];
      }
      return logs.reverse();
    }
  }
};
export default AuditService;
