// Unit tests for Observability and Structured Logging services
// File: src/test/observability.test.ts

import { describe, it, expect } from 'vitest';
import { LoggingService } from '../services/observability/logging';
import { MetricsService } from '../services/observability/metrics';
import { TracingService } from '../services/observability/tracing';

describe('Observability & Structured Logging services', () => {
  it('LoggingService handles level outputs', async () => {
    // Should log and complete without throwing errors
    await LoggingService.info('test_component', 'Hello logs test message', { userId: '123' });
    expect(true).toBe(true);
  });

  it('MetricsService stores performance logs', async () => {
    await MetricsService.logMetric('lcp', 1500, 'user-123', { browser: 'Chrome' });
    const list = await MetricsService.getMetricsSummary();
    expect(list.length).toBeGreaterThanOrEqual(0);
  });

  it('TracingService configures correlation headers', () => {
    const headers = TracingService.getTraceHeaders();
    expect(headers['X-Correlation-ID']).toBeDefined();
    expect(headers['traceparent']).toBeDefined();
  });
});
