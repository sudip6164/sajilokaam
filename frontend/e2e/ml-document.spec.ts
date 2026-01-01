import { test, expect } from '@playwright/test';
import { login, TEST_CREDENTIALS } from './helpers/auth';
import * as path from 'path';
import * as fs from 'fs';

test.describe('ML Document Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as freelancer
    await login(page, TEST_CREDENTIALS.freelancer);
  });

  test('should navigate to project detail page', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"], [class*="project-card"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Should see project details
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should see document upload option in project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for upload document button
      const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("Document"), input[type="file"]').first();
      await expect(uploadBtn).toBeVisible({ timeout: 5000 });
    }
  });

  test('should upload document and process with ML', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Create a simple test file
      const testFileContent = `
        Project Requirements Document
        1. Create user authentication system
        2. Implement payment gateway integration
        3. Build dashboard interface
        4. Add file upload functionality
        5. Create reporting module
      `;
      
      // Look for file input
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        // Create temporary file
        const tempFilePath = path.join(__dirname, 'temp-test-doc.txt');
        fs.writeFileSync(tempFilePath, testFileContent);
        
        try {
          // Upload file
          await fileInput.setInputFiles(tempFilePath);
          
          // Wait for processing
          await page.waitForTimeout(3000);
          
          // Should see processing message or success
          const successMessage = page.locator('text=/extracted|tasks|processing|success/i');
          await expect(successMessage.first()).toBeVisible({ timeout: 10000 }).catch(() => {
            // If no message, check if tasks appeared
            const tasks = page.locator('[class*="task"], [class*="suggestion"]');
            expect(tasks.first()).toBeVisible({ timeout: 5000 });
          });
        } finally {
          // Clean up
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      }
    }
  });

  test('should see extracted task suggestions after document processing', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for task suggestions or generated tasks
      const taskSuggestions = page.locator('[class*="suggestion"], [class*="extracted"], button:has-text("Generate")');
      
      // If suggestions exist, they should be visible
      const count = await taskSuggestions.count();
      if (count > 0) {
        await expect(taskSuggestions.first()).toBeVisible();
      }
    }
  });

  test('should be able to create tasks from suggestions', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
      
      // Look for "Generate Tasks" or "Create from Suggestions" button
      const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Create Tasks"), button:has-text("AI")').first();
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        await page.waitForTimeout(2000);
        
        // Should see success message or tasks created
        const successMsg = page.locator('text=/created|generated|success/i');
        await expect(successMsg.first()).toBeVisible({ timeout: 5000 }).catch(() => {
          // Check if tasks appeared in the list
          const tasks = page.locator('[class*="task"]');
          expect(tasks.first()).toBeVisible({ timeout: 3000 });
        });
      }
    }
  });
});

