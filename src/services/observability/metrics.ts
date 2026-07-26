// FitSync Metrics Service
// Tracks Core Web Vitals (LCP, CLS, INP), workout completions, and API response latencies

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface PerformanceMetric {
  id?: string;
  metric_name: string;
  value: number;
  user_id?: string;
  metadata?: any;
  created_at?: string;
}

export const MetricsService = {
  /**
   * Log numeric metrics value
   */
  async logMetric(metricName: string, value: number, userId?: string, metadata: any = {}): Promise<void> {
    const payload = {
      metric_name: metricName,
      value,
      user_id: userId || null,
      metadata: JSON.stringify(metadata)
    };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('performance_metrics').insert(payload);
      } else {
        const metrics = getFromMockDb<any>('performance_metrics');
        metrics.push({
          id: 'met-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('performance_metrics', metrics);
      }
    } catch {
      // Avoid crash on metric push
    }
  },

  /**
   * Fetch all metrics for rendering charts
   */
  async getMetricsSummary(): Promise<PerformanceMetric[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('performance_metrics').select('*').order('created_at', { ascending: false });
      return data || [];
    } else {
      return getFromMockDb<PerformanceMetric>('performance_metrics');
    }
  }
};
export default MetricsService;
