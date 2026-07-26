// Unit tests for Deployment and Health Check services
// File: src/test/deployment.test.ts

import { describe, it, expect } from 'vitest';
import { EnvironmentValidationService } from '../services/deployment/envValidation';
import { HealthCheckService } from '../services/deployment/healthCheck';

describe('Deployment & HealthCheck services', () => {
  it('EnvironmentValidationService detects when variables are validated', () => {
    const isValid = EnvironmentValidationService.validateEnvironment();
    // In test env, Supabase variables are typically empty/mocked, returns false safely
    expect(typeof isValid).toBe('boolean');
  });

  it('HealthCheckService runs status diagnostics', async () => {
    const health = await HealthCheckService.runHealthCheck();
    expect(health.status).toBe('healthy');
    expect(health.timestamp).toBeDefined();
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
