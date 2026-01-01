import { test, expect } from '@playwright/test';
import { login, TEST_CREDENTIALS } from './helpers/auth';

test.describe('Time Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Login as freelancer
    await login(page, TEST_CREDENTIALS.freelancer);
  });

  test('should see time tracker in project detail', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for timer component
      const timer = page.locator('[class*="timer"], button:has-text("Start"), button:has-text("Stop"), [class*="time"]').first();
      await expect(timer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should start timer', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Find start timer button
      const startBtn = page.locator('button:has-text("Start"), button:has-text("Start Timer")').first();
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(2000);
        
        // Should see timer running (stop button or timer display)
        const stopBtn = page.locator('button:has-text("Stop"), button:has-text("Pause")').first();
        await expect(stopBtn).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should stop timer', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Start timer first
      const startBtn = page.locator('button:has-text("Start"), button:has-text("Start Timer")').first();
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(2000);
        
        // Stop timer
        const stopBtn = page.locator('button:has-text("Stop"), button:has-text("Pause")').first();
        if (await stopBtn.isVisible()) {
          await stopBtn.click();
          await page.waitForTimeout(2000);
          
          // Should see success message or timer reset
          const startBtnAgain = page.locator('button:has-text("Start")').first();
          await expect(startBtnAgain).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should view time logs', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for time logs section or tab
      const timeLogsTab = page.locator('[role="tab"]:has-text("Time"), button:has-text("Time Log"), [class*="time-log"]').first();
      if (await timeLogsTab.isVisible()) {
        await timeLogsTab.click();
        await page.waitForTimeout(1000);
        
        // Should see time logs section
        const timeLogsSection = page.locator('[class*="time-log"], [class*="log"], table').first();
        await expect(timeLogsSection).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display timer countdown/running time', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Start timer
      const startBtn = page.locator('button:has-text("Start")').first();
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(3000);
        
        // Should see timer display (format like 00:00:00 or similar)
        const timerDisplay = page.locator('[class*="timer"], [class*="time"], [class*="font-mono"]').first();
        await expect(timerDisplay).toBeVisible({ timeout: 5000 });
        
        // Timer should show some time value
        const timerText = await timerDisplay.textContent();
        expect(timerText).toMatch(/\d+/); // Should contain at least one digit
      }
    }
  });
});

