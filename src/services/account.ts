// FitSync Account Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles deactivating, deleting, recovering accounts, and logging audits

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export const AccountService = {
  /**
   * Deactivate Account
   */
  async deactivateAccount(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      // Toggle profile active state or insert log
      await supabase.from('account_logs').insert({
        user_id: userId,
        action: 'account_deactivation',
        ip_address: '127.0.0.1'
      });
    } else {
      console.log(`Mock Deactivate: User account ${userId} deactivated`);
    }
  },

  /**
   * Delete Account
   */
  async deleteAccount(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        // Fallback for non-admin client context: delete from profiles cascade
        await supabase.from('profiles').delete().eq('id', userId);
      }
    } else {
      // Delete from mockDB profiles
      const profiles = getFromMockDb<any>('profiles');
      const filtered = profiles.filter((p: any) => p.id !== userId);
      saveToMockDb('profiles', filtered);
    }
  },

  /**
   * Log action audit
   */
  async logAction(userId: string, action: string, ip?: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('account_logs').insert({
        user_id: userId,
        action,
        ip_address: ip || '127.0.0.1'
      });
    } else {
      const logs = getFromMockDb<any>('account_logs');
      logs.push({
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        action,
        ip_address: ip || '127.0.0.1',
        created_at: new Date().toISOString()
      });
      saveToMockDb('account_logs', logs);
    }
  }
};
export default AccountService;
