// FitSync Hook: usePerformance
// Monitors page rendering times and FCP milestones

import { useEffect, useState } from 'react';
import { PerformanceService, type WebMetrics } from '../services/performance';

export const usePerformance = (componentName: string) => {
  const [metrics, setMetrics] = useState<WebMetrics | null>(null);

  useEffect(() => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      const renderDuration = end - start;
      PerformanceService.logPerformanceMetric(componentName, renderDuration);
      
      const met = PerformanceService.getPerformanceMetrics();
      setMetrics({
        ...met,
        renderTime: Math.round(renderDuration)
      });
    };
  }, [componentName]);

  return metrics;
};

export default usePerformance;
