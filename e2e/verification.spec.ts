import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('FitSync Complete Page Verification Spec', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(({ page }) => {
    consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });
  });

  test('run full visual page verification flows', async ({ page }) => {
    test.setTimeout(120000);
    const screenshotDir = 'C:/Users/purus/.gemini/antigravity/brain/8accd593-ae48-46da-9823-9c5694c4191e/screenshots';

    // 1. Landing Page
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'landing_page.png'), fullPage: true });
    expect(consoleErrors.length).toBe(0);

    // 2. Login Page
    await page.goto('/login');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'login_page.png') });
    expect(consoleErrors.length).toBe(0);

    // Perform Login (Mock Database fallback logs in successfully with any credentials)
    await page.fill('input[type="email"]', 'athlete@fitsync.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for Dashboard navigation
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard_page.png') });
    expect(consoleErrors.length).toBe(0);

    // 3. Signup Page
    await page.goto('/signup');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'signup_page.png') });

    // 4. Forgot Password
    await page.goto('/forgot-password');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'forgot_password_page.png') });

    // private pages
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    const privatePages = [
      { url: '/fitness', name: 'fitness_tracker_page.png' },
      { url: '/friends', name: 'friends_page.png' },
      { url: '/leaderboard', name: 'leaderboard_page.png' },
      { url: '/challenges', name: 'challenges_page.png' },
      { url: '/workouts', name: 'workouts_page.png' },
      { url: '/settings', name: 'settings_page.png' },
      { url: '/profile', name: 'profile_page.png' },
      { url: '/notifications', name: 'notifications_page.png' },
      { url: '/ai', name: 'ai_page.png' },
      { url: '/admin', name: 'admin_page.png' },
      { url: '/analytics', name: 'analytics_page.png' },
      { url: '/media', name: 'media_page.png' },
      { url: '/devdocs', name: 'devdocs_page.png' }
    ];

    for (const p of privatePages) {
      consoleErrors = [];
      await page.goto(p.url);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotDir, p.name) });
      console.log(`[Verification] Checked ${p.url} - Console errors: ${consoleErrors.length}`);
      expect(consoleErrors.length).toBe(0);
    }
  });
});
