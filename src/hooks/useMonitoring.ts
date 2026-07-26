// FitSync Hook: useMonitoring
// Gathers latency benchmarks, online statuses, and system errors logs for dashboard charts

import { useState, useEffect } from 'react';
import { HealthCheckService, type HealthCheckResult } from '../services/deployment/healthCheck';
import { ErrorTrackerService } from '../services/observability/errorTracker';

export const useMonitoring = () => {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [errorsCount, setErrorsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const h = await HealthCheckService.runHealthCheck();
      setHealth(h);

      const errs = await ErrorTrackerService.getRecentErrors();
      setErrorsCount(errs.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30s interval
    return () => clearInterval(interval);
  }, []);

  return {
    health,
    errorsCount,
    loading,
    refetch: fetchStatus
  };
};

export default useMonitoring;
