// FitSync GDPR Privacy & Consent Management Service
// Stores and registers marketing cookies and health metric analysis consents

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface PrivacyConsent {
  id?: string;
  user_id: string;
  consent_given: boolean;
  consent_type: 'cookies_marketing' | 'health_metrics_analysis';
  created_at?: string;
}

export const PrivacyService = {
  /**
   * Save user privacy consent setting
   */
  async recordConsent(userId: string, type: 'cookies_marketing' | 'health_metrics_analysis', given: boolean): Promise<void> {
    const payload = {
      user_id: userId,
      consent_type: type,
      consent_given: given
    };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('privacy_consents').insert(payload);
      } else {
        const list = getFromMockDb<any>('privacy_consents');
        list.push({
          id: 'con-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('privacy_consents', list);
      }
    } catch {
      // avoid crash
    }
  },

  /**
   * Check if user has granted consent
   */
  async checkConsent(userId: string, type: 'cookies_marketing' | 'health_metrics_analysis'): Promise<boolean> {
    try {
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('privacy_consents')
          .select('consent_given')
          .eq('user_id', userId)
          .eq('consent_type', type)
          .order('created_at', { ascending: false })
          .limit(1);
        return data?.[0]?.consent_given || false;
      } else {
        const list = getFromMockDb<PrivacyConsent>('privacy_consents');
        const match = list.filter((c) => c.user_id === userId && c.consent_type === type).pop();
        return match?.consent_given || false;
      }
    } catch {
      return false; // Fail secure
    }
  }
};
export default PrivacyService;
