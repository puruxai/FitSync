// Playwright E2E browser tests: Authentication and Loading flows
// File: e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('FitSync E2E Application Flows', () => {
  test('should load the authentication page and show inputs', async ({ page }) => {
    // Navigate to landing
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/FitSync/i);

    // Verify presence of email login field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});
