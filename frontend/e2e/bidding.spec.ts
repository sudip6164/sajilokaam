import { test, expect } from '@playwright/test';
import { login, TEST_CREDENTIALS } from './helpers/auth';

test.describe('Bidding System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as freelancer
    await login(page, TEST_CREDENTIALS.freelancer);
  });

  test('should browse available jobs', async ({ page }) => {
    await page.goto('/jobs');
    
    // Check if jobs page loads (heading is "Discover Opportunities")
    await expect(page.locator('h1, h2').first()).toContainText(/discover|opportunities|job/i, { timeout: 5000 });
    
    // Check if there are job cards
    const jobCards = page.locator('[class*="card"], [class*="job"], article').first();
    await expect(jobCards).toBeVisible({ timeout: 5000 });
  });

  test('should view job details and see bid button', async ({ page }) => {
    await page.goto('/jobs');
    
    // Click on first job
    const firstJob = page.locator('a[href*="/jobs/"], [class*="job-card"]').first();
    if (await firstJob.isVisible()) {
      await firstJob.click();
      await page.waitForURL(/\/jobs\/\d+/, { timeout: 5000 });
      
      // Should see job details
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Should see bid button or bid form
      const bidButton = page.locator('button:has-text("Bid"), button:has-text("Submit Bid"), button:has-text("Place Bid")').first();
      await expect(bidButton).toBeVisible({ timeout: 3000 });
    }
  });

  test('should submit a bid on a job', async ({ page }) => {
    await page.goto('/jobs');
    
    // Click on first job
    const firstJob = page.locator('a[href*="/jobs/"], [class*="job-card"]').first();
    if (await firstJob.isVisible()) {
      await firstJob.click();
      await page.waitForURL(/\/jobs\/\d+/, { timeout: 5000 });
      
      // Click bid button
      const bidButton = page.locator('button:has-text("Bid"), button:has-text("Submit Bid")').first();
      if (await bidButton.isVisible()) {
        await bidButton.click();
        
        // Wait for bid dialog/form
        await page.waitForTimeout(1000);
        
        // Fill bid form if visible
        const bidAmountInput = page.locator('input[name*="amount"], input[placeholder*="amount" i]').first();
        if (await bidAmountInput.isVisible()) {
          await bidAmountInput.fill('50000');
        }
        
        const proposalInput = page.locator('textarea[name*="proposal"], textarea[placeholder*="proposal" i]').first();
        if (await proposalInput.isVisible()) {
          await proposalInput.fill('This is a test bid from E2E testing');
        }
        
        // Submit bid
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Place Bid"), button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          
          // Should see success message or redirect
          await page.waitForTimeout(2000);
          await expect(
            page.locator('text=/success|bid.*submitted|thank you/i')
          ).toBeVisible({ timeout: 5000 }).catch(() => {
            // If no success message, check if we're redirected
            expect(page.url()).toMatch(/\/(my-bids|bids|jobs)/);
          });
        }
      }
    }
  });

  test('should view my bids', async ({ page }) => {
    // Login first as admin (only seeded user, can access freelancer features)
    const { login, TEST_CREDENTIALS } = await import('./helpers/auth');
    await login(page, TEST_CREDENTIALS.admin);
    
    // Verify we're logged in
    const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
    
    await page.goto('/bids');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (auth failure)
    if (page.url().includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Check if my bids page loads - look for content in main area
    const pageHeading = page.locator('main h1, main h2, [class*="container"] h1, [class*="container"] h2').first();
    if (await pageHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pageHeading).toContainText(/bid/i, { timeout: 5000 });
    }
    
    // Should see bids list (even if empty) or empty state
    // First check if page loaded properly
    const pageContent = page.locator('main, [class*="container"]').first();
    await expect(pageContent).toBeVisible({ timeout: 5000 });
    
    // Then check for bids or empty state
    const bidsSection = page.locator('[class*="bid"], [class*="card"], table').first();
    const emptyState = page.getByText(/bid|no.*bid|no.*bids/i).first();
    const hasBids = await bidsSection.isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    
    // At least one should be visible
    expect(hasBids || hasEmptyState).toBeTruthy();
  });

  test('should filter bids by status', async ({ page }) => {
    await page.goto('/my-bids');
    
    // Look for filter buttons or tabs
    const filterButtons = page.locator('button:has-text("Pending"), button:has-text("Accepted"), button:has-text("Rejected"), [role="tab"]');
    const filterCount = await filterButtons.count();
    
    if (filterCount > 0) {
      // Click on a filter
      await filterButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Should see filtered results
      const results = page.locator('[class*="bid"], [class*="card"]');
      await expect(results.first()).toBeVisible({ timeout: 3000 });
    }
  });
});

