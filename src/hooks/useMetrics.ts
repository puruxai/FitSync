// FitSync Hook: useMetrics
// Queries metric items and aggregates average response latencies

import { useState, useEffect } from 'react';
import { MetricsService, type PerformanceMetric } from '../services/observability/metrics';

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await MetricsService.getMetricsSummary();
      setMetrics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    refetch: fetchMetrics
  };
};

export default useMetrics;
