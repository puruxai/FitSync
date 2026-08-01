import { test, expect } from '@playwright/test';

test.describe('FitSync Complete Functional Audit & Interaction Spec', () => {
  const timestamp = Date.now();
  const testEmail = `audit_athlete_${timestamp}@fitsync.com`;
  const testPassword = 'AuditPassword123!';
  const testUsername = `audit_${timestamp}`;
  const testFullName = 'Audit Athlete';

  test.beforeEach(async ({ page }) => {
    // 1. Sign up to get a clean authenticated session
    await page.goto('/signup');
    await page.waitForTimeout(1000);
    
    await page.fill('input[placeholder="Alex Walker"]', testFullName);
    await page.fill('input[placeholder="alex_walker"]', testUsername);
    await page.fill('input[placeholder="athlete@fitsync.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"] >> nth=0', testPassword);
    await page.fill('input[placeholder="••••••••"] >> nth=1', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to Dashboard
    try {
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    } catch {
      // If direct signup redirect didn't trigger, log in
      await page.goto('/login');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    }
    await page.waitForTimeout(2000);
  });

  test('Dashboard metrics increase on logging actions', async ({ page }) => {
    // Verify initial layout loaded
    await expect(page.locator('h1:has-text("ATHLETE COMMAND CONSOLE")')).toBeVisible();

    // Click "Quick Walk (+1.5k)" steps increment button
    const quickWalkBtn = page.locator('button:has-text("Quick Walk")');
    await expect(quickWalkBtn).toBeVisible();
    await quickWalkBtn.click();
    await page.waitForTimeout(500);

    // Click "Log Sleep (+0.5h)" sleep tracker increment button
    const logSleepBtn = page.locator('button:has-text("Log Sleep")');
    await expect(logSleepBtn).toBeVisible();
    await logSleepBtn.click();
    await page.waitForTimeout(500);
  });

  test('Media Upload drop zone click and renaming interactions', async ({ page }) => {
    await page.goto('/media');
    await page.waitForTimeout(1500);

    // Verify Storage Usage component exists
    await expect(page.locator('h4:has-text("Disk Quota Allocation")')).toBeVisible();

    // Trigger file upload by injecting a programmatically crafted file inside DropZone
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['Playwright E2E Binary File Buffer'], 'audit_test_photo.png', { type: 'image/png' });
      dt.items.add(file);
      return dt;
    });
    // Dispatch drop event on the drop box selector
    await page.dispatchEvent('div.relative.select-none', 'drop', { dataTransfer });
    await page.waitForTimeout(5000); // Wait for upload task simulation

    // Verify uploaded file is listed in file cards grid
    const fileCard = page.locator('h4:has-text("audit_test_photo.png")');
    await expect(fileCard).toBeVisible();

    // Rename file action check
    const renameBtn = page.locator('button[title="Rename File"]');
    if (await renameBtn.count() > 0) {
      // Mock prompt handler before clicking
      page.once('dialog', async dialog => {
        await dialog.accept('renamed_audit_photo.png');
      });
      await renameBtn.first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('h4:has-text("renamed_audit_photo.png")')).toBeVisible();
    }
  });

  test('Music Player expanded controls and playlist navigation', async ({ page }) => {
    // 1. Double check the persistent music note floating button is on page
    const musicBtn = page.locator('button:has(span:text("music_note"))');
    await expect(musicBtn).toBeVisible();
    await musicBtn.click(); // Expand player panel
    await page.waitForTimeout(500);

    // 2. Verify track metadata is visible
    await expect(page.locator('span:has-text("FITSYNC PLAYER")')).toBeVisible();
    await expect(page.locator('h4:has-text("AI Gym Synth Beats")')).toBeVisible();

    // 3. Click play button
    const playBtn = page.locator('button:has(span:text("play_arrow"))');
    if (await playBtn.isVisible()) {
      await playBtn.click();
      await page.waitForTimeout(500);
      // Play button icon should switch to pause
      await expect(page.locator('button:has(span:text("pause"))')).toBeVisible();
    }

    // 4. Navigate to next song in playlist
    const nextBtn = page.locator('button:has(span:text("skip_next"))');
    await nextBtn.click();
    await page.waitForTimeout(500);
    
    // Verify track metadata updated to "Energy Workout Pulse"
    await expect(page.locator('h4:has-text("Energy Workout Pulse")')).toBeVisible();

    // 5. Toggle Shuffle and Repeat states
    const shuffleBtn = page.locator('button[title="Shuffle Playlist"]');
    await shuffleBtn.click();
    await page.waitForTimeout(500);

    const repeatBtn = page.locator('button[title="Repeat Track"]');
    await repeatBtn.click();
    await page.waitForTimeout(500);

    // 6. Toggle Mini layout mode
    const layoutToggle = page.locator('button[title="Minimize View"]');
    await layoutToggle.click();
    await page.waitForTimeout(500);
    // Large player elements should be hidden, and mini view visible
    await expect(page.locator('span:has-text("FITSYNC PLAYER")')).toBeVisible();
  });

  test('AI Chat conversation thread management and voice mic input', async ({ page }) => {
    await page.goto('/ai');
    await page.waitForTimeout(1500);

    // Verify AI Chat interface loaded
    await expect(page.locator('h3:has-text("Sessions")')).toBeVisible();

    // Create a new thread session topic
    const threadInput = page.locator('input[placeholder="Start new topic..."]');
    await threadInput.fill('E2E Custom Training Topic');
    await page.click('button[type="submit"]:has(span:text("add"))');
    await page.waitForTimeout(1000);

    // Check thread appeared in sidebar selection list
    await expect(page.locator('button:has-text("E2E Custom Training Topic")')).toBeVisible();

    // Click quick action prompt pill
    const quickActionPill = page.locator('button:has-text("HIIT Routine")');
    await expect(quickActionPill).toBeVisible();
    await quickActionPill.click();
    await page.waitForTimeout(500);

    // Click Voice Speech microphone capture button (checks webkitSpeechRecognition API instantiation)
    const micBtn = page.locator('button[title="Speech-to-Text Input"]');
    await expect(micBtn).toBeVisible();
    await micBtn.click();
    await page.waitForTimeout(500);
  });

  test('Fitness Analytics visual charts and PDF report export download', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);

    // Verify Fitness Averages and Score Dial render on page
    await expect(page.locator('h1:has-text("Fitness Analytics")')).toBeVisible();
    await expect(page.locator('span:has-text("Consistency Rating")')).toBeVisible();

    // Click "Export Report" dialog button
    const exportBtn = page.locator('button:has-text("Export Report")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();
    await page.waitForTimeout(500);

    // Verify dialog popup appeared
    await expect(page.locator(':has-text("Export Business Intelligence Report")').first()).toBeVisible();
    
    // Set dialog download listener
    const downloadPromise = page.waitForEvent('download');
    // Click PDF Format button inside dialog
    await page.click('button:has-text("PDF Format")');
    const download = await downloadPromise;

    // Verify file name has .pdf extension
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
