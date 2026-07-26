// Unit tests for API versioning and documentation services
// File: src/test/devdocs.test.ts

import { describe, it, expect } from 'vitest';
import { VersioningService } from '../services/devdocs/versioning';
import { ApiDocumentationService } from '../services/devdocs/docs';

describe('Developer Docs & Versioning services', () => {
  it('VersioningService tracks active versions and compatibility rules', () => {
    const details = VersioningService.getVersionDetails('v1');
    expect(details).toBeDefined();
    expect(details?.version).toBe('1.4.0');
    expect(details?.status).toBe('active');

    const isCompat = VersioningService.isCompatible('v1');
    expect(isCompat).toBe(true);

    const oldCompat = VersioningService.isCompatible('v0');
    expect(oldCompat).toBe(true);
  });

  it('ApiDocumentationService falls back to local specs on fetch error', async () => {
    const spec = await ApiDocumentationService.getOpenApiSpec();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info).toBeDefined();
  });
});
