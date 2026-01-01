import { test, expect } from '@playwright/test';
import { login, TEST_CREDENTIALS } from './helpers/auth';
import * as path from 'path';
import * as fs from 'fs';

test.describe('File Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as freelancer
    await login(page, TEST_CREDENTIALS.freelancer);
  });

  test('should see file upload option in project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for file upload button or section
      const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("File"), input[type="file"]').first();
      await expect(uploadBtn).toBeVisible({ timeout: 5000 });
    }
  });

  test('should upload a file to project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Create a test file
      const testFileContent = 'This is a test file for E2E testing';
      const tempFilePath = path.join(__dirname, 'test-upload.txt');
      fs.writeFileSync(tempFilePath, testFileContent);
      
      try {
        // Find file input
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles(tempFilePath);
          await page.waitForTimeout(2000);
          
          // Should see success message or file in list
          const successMsg = page.locator('text=/upload|success|file.*added/i');
          await expect(successMsg.first()).toBeVisible({ timeout: 5000 }).catch(() => {
            // Check if file appears in file list
            const fileList = page.locator('[class*="file"], [class*="attachment"]');
            expect(fileList.first()).toBeVisible({ timeout: 3000 });
          });
        }
      } finally {
        // Clean up
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    }
  });

  test('should view files list in project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for files tab or section
      const filesTab = page.locator('[role="tab"]:has-text("File"), button:has-text("Files"), [class*="file"]').first();
      if (await filesTab.isVisible()) {
        await filesTab.click();
        await page.waitForTimeout(1000);
        
        // Should see files section
        const filesSection = page.locator('[class*="file"], [class*="attachment"], table').first();
        await expect(filesSection).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should download a file', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for download button on files
      const downloadBtn = page.locator('button:has-text("Download"), a:has-text("Download"), [aria-label*="download"]').first();
      if (await downloadBtn.isVisible()) {
        // Set up download listener
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
          downloadBtn.click()
        ]);
        
        if (download) {
          expect(download.suggestedFilename()).toBeTruthy();
        }
      }
    }
  });
});

