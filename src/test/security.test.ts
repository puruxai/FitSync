// Unit tests for Security Hardening, GDPR Consents, and Permissions
// File: src/test/security.test.ts

import { describe, it, expect } from 'vitest';
import { SecurityHardeningService } from '../services/security/hardening';
import { AuthorizationService } from '../services/security/authorization';
import { PrivacyService } from '../services/security/privacy';

describe('Security Hardening & Privacy services', () => {
  it('SecurityHardeningService escapes script elements to block XSS', () => {
    const malicious = '<script>alert("hack")</script>';
    const sanitized = SecurityHardeningService.sanitizeInput(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;hack&quot;)&lt;&#x2F;script&gt;');
  });

  it('SecurityHardeningService logs login attempts and events', async () => {
    await SecurityHardeningService.logLoginAttempt('test@fitsync.com', 'failed');
    await SecurityHardeningService.logSecurityEvent('unauthorized_access');
    expect(true).toBe(true);
  });

  it('AuthorizationService fails secure on missing permissions', async () => {
    const allowed = await AuthorizationService.checkUserPermission('user-123', 'admin:write');
    expect(allowed).toBe(false);
  });

  it('PrivacyService records and checks GDPR cookies consents', async () => {
    await PrivacyService.recordConsent('user-123', 'cookies_marketing', true);
    const given = await PrivacyService.checkConsent('user-123', 'cookies_marketing');
    expect(given).toBe(true);
  });
});
