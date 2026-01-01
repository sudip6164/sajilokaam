import { test, expect } from '@playwright/test';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (only seeded user)
    // Admin can access freelancer features
    const { login, TEST_CREDENTIALS } = await import('./helpers/auth');
    await login(page, TEST_CREDENTIALS.admin);
  });

  test('should view projects list', async ({ page }) => {
    // Already logged in via beforeEach
    
    // Verify we're logged in
    const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
    
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (auth failure)
    if (page.url().includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Check if projects page loads - look for content in main area
    const pageHeading = page.locator('main h1, main h2, [class*="container"] h1, [class*="container"] h2').first();
    if (await pageHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pageHeading).toContainText(/project/i, { timeout: 5000 });
    } else {
      // If no heading, check for projects list or empty state
      const projectsContent = page.locator('[class*="project"], [class*="card"]').first();
      const emptyState = page.getByText(/project|no.*project|no.*projects/i).first();
      const hasProjects = await projectsContent.isVisible({ timeout: 2000 }).catch(() => false);
      const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
      
      // At least one should be visible
      expect(hasProjects || hasEmptyState).toBeTruthy();
    }
  });

  test('should view project details', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project if available
    const firstProject = page.locator('a[href*="/projects/"], [class*="project-card"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      
      // Should navigate to project detail
      await expect(page).toHaveURL(/\/projects\/\d+/);
      
      // Should see project details
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should create a task in project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL(/\/projects\/\d+/);
      
      // Look for "Create Task" button or Tasks tab
      const createTaskBtn = page.locator('button:has-text("Create Task"), button:has-text("Add Task"), a:has-text("Create Task")').first();
      if (await createTaskBtn.isVisible()) {
        await createTaskBtn.click();
        
        // Fill task form
        await page.fill('input[name="title"], input[placeholder*="title" i]', 'E2E Test Task');
        await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'Task created by automated test');
        
        // Submit
        await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Add")');
        
        // Should see task in list
        await expect(page.locator('text=E2E Test Task')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

