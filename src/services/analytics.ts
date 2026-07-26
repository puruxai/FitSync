// FitSync Analytics and Clickstreams Service (Dual Mode: Supabase or Local Fallback)
// Handles logging telemetry events, DAU/MAU counters, and usage statistics updates

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface AnalyticsEvent {
  id?: string;
  user_id: string;
  event_type: string;
  details?: any;
  created_at?: string;
}

export const AnalyticsService = {
  /**
   * Log clickstream or navigation event
   */
  async logEvent(userId: string, eventType: string, details?: any): Promise<void> {
    const payload = {
      user_id: userId,
      event_type: eventType,
      details: details || {}
    };

    if (isSupabaseConfigured) {
      await supabase.from('analytics_events').insert(payload);
    } else {
      const list = getFromMockDb<AnalyticsEvent>('analytics_events');
      list.push({
        id: 'evt-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      });
      saveToMockDb('analytics_events', list);
    }
  },

  /**
   * Increment usage counters (AI recomms, meal plans)
   */
  async incrementUsageCounter(userId: string, counterName: 'ai_conversations_count' | 'workout_recos_used' | 'diet_plans_created' | 'predictions_viewed' | 'insights_generated'): Promise<void> {
    if (isSupabaseConfigured) {
      // Fetch current or seed
      const { data } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        await supabase
          .from('usage_metrics')
          .update({ [counterName]: (data[counterName] || 0) + 1 })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('usage_metrics')
          .insert({
            user_id: userId,
            ai_conversations_count: counterName === 'ai_conversations_count' ? 1 : 0,
            workout_recos_used: counterName === 'workout_recos_used' ? 1 : 0,
            diet_plans_created: counterName === 'diet_plans_created' ? 1 : 0,
            predictions_viewed: counterName === 'predictions_viewed' ? 1 : 0,
            insights_generated: counterName === 'insights_generated' ? 1 : 0
          });
      }
    } else {
      const list = getFromMockDb<any>('usage_metrics');
      const idx = list.findIndex((m: any) => m.user_id === userId);
      if (idx !== -1) {
        list[idx][counterName] = (list[idx][counterName] || 0) + 1;
      } else {
        list.push({
          id: 'use-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          ai_conversations_count: counterName === 'ai_conversations_count' ? 1 : 0,
          workout_recos_used: counterName === 'workout_recos_used' ? 1 : 0,
          diet_plans_created: counterName === 'diet_plans_created' ? 1 : 0,
          predictions_viewed: counterName === 'predictions_viewed' ? 1 : 0,
          insights_generated: counterName === 'insights_generated' ? 1 : 0,
          updated_at: new Date().toISOString()
        });
      }
      saveToMockDb('usage_metrics', list);
    }
  }
};
export default AnalyticsService;
