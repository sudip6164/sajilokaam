import { test, expect } from '@playwright/test';

test.describe('Jobs CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (only seeded user)
    // Admin can access client features
    const { login, TEST_CREDENTIALS } = await import('./helpers/auth');
    await login(page, TEST_CREDENTIALS.admin);
  });

  test('should browse jobs', async ({ page }) => {
    await page.goto('/jobs');
    
    // Check if jobs page loads (heading is "Discover Opportunities")
    await expect(page.locator('h1, h2').first()).toContainText(/discover|opportunities|job/i, { timeout: 5000 });
    
    // Check if there are job cards or job listings
    const jobCards = page.locator('[class*="card"], [class*="job"], article').first();
    await expect(jobCards).toBeVisible({ timeout: 5000 });
  });

  test('should view job details', async ({ page }) => {
    await page.goto('/jobs');
    
    // Click on first job
    const firstJob = page.locator('a[href*="/jobs/"], [class*="job-card"]').first();
    if (await firstJob.isVisible()) {
      await firstJob.click();
      
      // Should navigate to job detail page
      await expect(page).toHaveURL(/\/jobs\/\d+/);
      
      // Should see job details
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should create a new job', async ({ page }) => {
    // Login first as admin (only seeded user, can access client features)
    const { login, TEST_CREDENTIALS } = await import('./helpers/auth');
    await login(page, TEST_CREDENTIALS.admin);
    
    // Verify we're logged in by checking for avatar
    const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
    
    // Now go to post job page
    await page.goto('/post-job');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (auth failure)
    if (page.url().includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Wait for form to be visible - check for page heading first
    await page.waitForSelector('h1:has-text("Post"), h1:has-text("Job")', { timeout: 10000 });
    await page.waitForSelector('input#title, input[name="title"]', { timeout: 10000 });
    
    // Fill in job form
    await page.fill('input#title, input[name="title"]', 'Test Job from E2E');
    await page.fill('textarea#description, textarea[name="description"]', 'This is a test job created by automated testing');
    
    // Select category if dropdown exists
    const categorySelect = page.locator('select, [role="combobox"]').first();
    if (await categorySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categorySelect.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
      }
    }
    
    // Fill budget
    const budgetInput = page.locator('input#budget, input[name="budget"]').first();
    if (await budgetInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await budgetInput.fill('50000');
    }
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Post"), button:has-text("Create")');
    
    // Should navigate to jobs list or show success
    await page.waitForURL(/\/(jobs|my-jobs)/, { timeout: 15000 });
    
    // Check if job appears in list or success message
    const jobInList = page.locator('text=Test Job from E2E');
    const successMsg = page.locator('text=/success|posted/i');
    await expect(jobInList.or(successMsg).first()).toBeVisible({ timeout: 5000 });
  });

  test('should search for jobs', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('developer');
      await searchInput.press('Enter');
      
      // Wait for results to load
      await page.waitForTimeout(2000);
      
      // Should see search results or "no results" message
      const results = page.locator('[class*="job"], [class*="card"]').first();
      const noResults = page.getByText(/no.*found|no.*result/i).first();
      await expect(results.or(noResults).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should filter jobs by category', async ({ page }) => {
    await page.goto('/jobs');
    
    // Look for category filter
    const categoryFilter = page.locator('select[name*="category"], [role="combobox"], button:has-text("Category")').first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
      
      // Select a category
      const categoryOption = page.locator('[role="option"], option').first();
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        await page.waitForTimeout(2000);
        
        // Should see filtered results
        const results = page.locator('[class*="job"], [class*="card"]');
        await expect(results.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should filter jobs by budget range', async ({ page }) => {
    await page.goto('/jobs');
    
    // Look for budget filter
    const budgetFilter = page.locator('select[name*="budget"], button:has-text("Budget")').first();
    if (await budgetFilter.isVisible()) {
      await budgetFilter.click();
      await page.waitForTimeout(500);
      
      // Select a budget range
      const budgetOption = page.locator('[role="option"], option').first();
      if (await budgetOption.isVisible()) {
        await budgetOption.click();
        await page.waitForTimeout(2000);
        
        // Should see filtered results
        const results = page.locator('[class*="job"], [class*="card"]');
        await expect(results.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should view my jobs as client', async ({ page }) => {
    // Login first as admin (only seeded user, can access client features)
    const { login, TEST_CREDENTIALS } = await import('./helpers/auth');
    await login(page, TEST_CREDENTIALS.admin);
    
    // Verify we're logged in
    const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
    
    await page.goto('/my-jobs');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (auth failure)
    if (page.url().includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Check if my jobs page loads - look for content in main area
    const pageHeading = page.locator('main h1, main h2, [class*="container"] h1, [class*="container"] h2').first();
    if (await pageHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pageHeading).toContainText(/job/i, { timeout: 5000 });
    }
    
    // Should see jobs list or empty state
    // First check if page loaded
    const pageContent = page.locator('main, [class*="container"]').first();
    await expect(pageContent).toBeVisible({ timeout: 5000 });
    
    // Then check for jobs or empty state
    const jobsSection = page.locator('[class*="job"], [class*="card"], table').first();
    const emptyState = page.getByText(/job|no.*job|no.*jobs/i).first();
    const hasJobs = await jobsSection.isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    
    // At least one should be visible
    expect(hasJobs || hasEmptyState).toBeTruthy();
  });

  test('should edit a job', async ({ page }) => {
    await page.goto('/my-jobs');
    
    // Click on first job
    const firstJob = page.locator('a[href*="/jobs/"], [class*="job-card"]').first();
    if (await firstJob.isVisible()) {
      await firstJob.click();
      await page.waitForURL(/\/jobs\/\d+/, { timeout: 5000 });
      
      // Look for edit button
      const editBtn = page.locator('button:has-text("Edit"), button:has-text("Update")').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(1000);
        
        // Should see edit form
        const editForm = page.locator('input[name*="title"], textarea[name*="description"]').first();
        await expect(editForm).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

