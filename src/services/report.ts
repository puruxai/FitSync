// FitSync Moderation Reports Service
// Handles fetching, creating, and resolving content/profile moderation flags

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  category: 'spam' | 'abuse' | 'fake_profile' | 'harassment' | 'inappropriate_content';
  reason: string;
  status: 'pending' | 'resolved_approved' | 'resolved_rejected';
  created_at: string;
  reporter_name?: string;
  reported_name?: string;
}

export const ReportService = {
  /**
   * Submit a report
   */
  async submitReport(
    reporterId: string,
    reportedUserId: string,
    category: ModerationReport['category'],
    reason: string
  ): Promise<void> {
    const payload = {
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      category,
      reason,
      status: 'pending' as const
    };

    if (isSupabaseConfigured) {
      await supabase.from('reports').insert(payload);
    } else {
      const list = getFromMockDb<ModerationReport>('reports');
      list.push({
        id: 'rep-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      });
      saveToMockDb('reports', list);
    }
  },

  /**
   * Get all reports list
   */
  async getReports(): Promise<ModerationReport[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as ModerationReport[]) || [];
    } else {
      const list = getFromMockDb<ModerationReport>('reports');
      if (list.length === 0) {
        // Seed default report
        const defaultRep: ModerationReport = {
          id: 'rep-seed',
          reporter_id: 'usr-1',
          reported_user_id: 'usr-2',
          category: 'spam',
          reason: 'Spamming daily workout links in profile bios',
          status: 'pending',
          created_at: new Date().toISOString(),
          reporter_name: 'Alex Rivers',
          reported_name: 'John Doe'
        };
        list.push(defaultRep);
        saveToMockDb('reports', list);
        return [defaultRep];
      }
      return list;
    }
  },

  /**
   * Resolve a report (Approve / Reject action)
   */
  async resolveReport(reportId: string, status: 'resolved_approved' | 'resolved_rejected'): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);
    } else {
      const list = getFromMockDb<ModerationReport>('reports');
      const idx = list.findIndex(r => r.id === reportId);
      if (idx !== -1) {
        list[idx].status = status;
        saveToMockDb('reports', list);
      }
    }
  }
};
export default ReportService;
