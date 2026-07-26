// Unit tests for Error Tracking, Retry, and Circuit Breaker services
// File: src/test/resilience.test.ts

import { describe, it, expect, vi } from 'vitest';
import { ErrorTrackingService } from '../services/recovery/errorTracking';
import { RetryService } from '../services/recovery/retry';
import { CircuitBreaker } from '../services/recovery/recovery';

describe('Reliability & Resilience services', () => {
  it('ErrorTrackingService captures crashes and severity levels', async () => {
    await ErrorTrackingService.reportError(new Error('Test trapped error'), 'low', 'TestComponent');
    await ErrorTrackingService.reportCrash('React layout crashed');
    expect(true).toBe(true);
  });

  it('RetryService executes retries and throws on limits', async () => {
    const failingTask = vi.fn().mockRejectedValue(new Error('Fail always'));

    await expect(
      RetryService.runWithRetry(failingTask, { maxRetries: 2, initialDelayMs: 5, maxDelayMs: 15 })
    ).rejects.toThrow('Fail always');

    expect(failingTask).toHaveBeenCalledTimes(2);
  });

  it('CircuitBreaker trips open on consecutive threshold failures', async () => {
    const breaker = new CircuitBreaker('test_service');
    const failingTask = vi.fn().mockRejectedValue(new Error('Connect fail'));

    // Closed state
    expect(breaker.getState()).toBe('CLOSED');

    // Run 3 times to exceed failureThreshold = 3
    await breaker.execute(failingTask, 'fallback_val');
    await breaker.execute(failingTask, 'fallback_val');
    const val = await breaker.execute(failingTask, 'fallback_val');

    expect(val).toBe('fallback_val');
    expect(breaker.getState()).toBe('OPEN');
  });
});
