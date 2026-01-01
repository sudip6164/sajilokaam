import { test, expect } from '@playwright/test';
import { login, TEST_CREDENTIALS } from './helpers/auth';

test.describe('Profile Management', () => {
  test.describe('Freelancer Profile', () => {
    test.beforeEach(async ({ page }) => {
      // Use admin credentials (only seeded user)
      await login(page, TEST_CREDENTIALS.admin);
    });

    test('should view freelancer profile page', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Check if profile page loads - look for content in main area
      const pageHeading = page.locator('main h1, main h2, [class*="container"] h1, [class*="container"] h2').first();
      if (await pageHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(pageHeading).toContainText(/profile/i, { timeout: 5000 });
      } else {
        // If no heading, check for profile form or content
        const profileContent = page.locator('form, [class*="profile"], input[name*="name"], input[name*="email"]').first();
        await expect(profileContent).toBeVisible({ timeout: 5000 });
      }
    });

    test('should edit profile information', async ({ page }) => {
      await page.goto('/profile');
      
      // Look for edit button
      const editBtn = page.locator('button:has-text("Edit"), button:has-text("Update")').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(1000);
        
        // Fill in some fields
        const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="bio" i]').first();
        if (await bioInput.isVisible()) {
          await bioInput.fill('Updated bio from E2E testing');
        }
        
        // Save changes
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          
          // Should see success message
          const successMsg = page.locator('text=/success|updated|saved/i');
          await expect(successMsg.first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Client Profile', () => {
    test.beforeEach(async ({ page }) => {
      // Use admin credentials (only seeded user)
      await login(page, TEST_CREDENTIALS.admin);
    });

    test('should view client profile page', async ({ page }) => {
      await page.goto('/client-profile');
      await page.waitForLoadState('networkidle');
      
      // Check if profile page loads - look for content in main area
      const pageHeading = page.locator('main h1, main h2, [class*="container"] h1, [class*="container"] h2').first();
      if (await pageHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(pageHeading).toContainText(/profile|company/i, { timeout: 5000 });
      } else {
        // If no heading, check for profile form or content
        const profileContent = page.locator('form, [class*="profile"], [class*="company"], input[name*="name"]').first();
        await expect(profileContent).toBeVisible({ timeout: 5000 });
      }
    });

    test('should edit company information', async ({ page }) => {
      await page.goto('/client-profile');
      
      // Look for edit button
      const editBtn = page.locator('button:has-text("Edit"), button:has-text("Update")').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(1000);
        
        // Fill in company description
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="description" i]').first();
        if (await descInput.isVisible()) {
          await descInput.fill('Updated company description from E2E testing');
        }
        
        // Save changes
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          
          // Should see success message
          const successMsg = page.locator('text=/success|updated|saved/i');
          await expect(successMsg.first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });
});

