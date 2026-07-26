// Unit tests for DevOps Environment and Build services
// File: src/test/devops.test.ts

import { describe, it, expect } from 'vitest';
import { EnvironmentService } from '../services/devops/environment';
import { BuildService } from '../services/devops/build';

describe('DevOps & Environment services', () => {
  it('EnvironmentService detects active modes and returns configs', () => {
    const mode = EnvironmentService.getActiveMode();
    expect(mode).toBe('testing'); // vitest environment default mode

    const config = EnvironmentService.getConfig();
    expect(config.mode).toBe('development'); // test fallback configuration
    expect(config.enableRealtime).toBe(true);
  });

  it('BuildService yields build version meta hashes', () => {
    const details = BuildService.getBuildDetails();
    expect(details.version).toBe('1.4.0');
    expect(details.buildHash).toContain('fs-');
    expect(details.isHealthy).toBe(true);
  });
});
