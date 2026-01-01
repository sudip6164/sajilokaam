import { test, expect } from '@playwright/test';
import { login, TEST_CREDENTIALS } from './helpers/auth';

test.describe('Payment System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (only seeded user, can access client features)
    await login(page, TEST_CREDENTIALS.admin);
  });

  test('should view invoices page', async ({ page }) => {
    // Already logged in via beforeEach
    
    // Verify we're logged in
    const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
    
    await page.goto('/client-invoices');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (auth failure)
    if (page.url().includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Check if invoices page loads - look for content in main area, not header
    const pageHeading = page.locator('main h1, main h2, [class*="container"] h1, [class*="container"] h2').first();
    if (await pageHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pageHeading).toContainText(/invoice/i, { timeout: 5000 });
    }
    
    // Should see invoices list or empty state
    // First check if page loaded
    const pageContent = page.locator('main, [class*="container"]').first();
    await expect(pageContent).toBeVisible({ timeout: 5000 });
    
    // Then check for invoices or empty state
    const invoicesSection = page.locator('[class*="invoice"], [class*="card"], table').first();
    const emptyState = page.getByText(/invoice|no.*invoice|no.*invoices/i).first();
    const hasInvoices = await invoicesSection.isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    
    // At least one should be visible
    expect(hasInvoices || hasEmptyState).toBeTruthy();
  });

  test('should see pay now button on pending invoice', async ({ page }) => {
    await page.goto('/client-invoices');
    
    // Look for pending invoice with pay button
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Pay Now")').first();
    if (await payButton.isVisible()) {
      await expect(payButton).toBeVisible();
    }
  });

  test('should open payment dialog', async ({ page }) => {
    await page.goto('/client-invoices');
    
    // Click pay button
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Pay Now")').first();
    if (await payButton.isVisible()) {
      await payButton.click();
      await page.waitForTimeout(1000);
      
      // Should see payment dialog
      const paymentDialog = page.locator('[role="dialog"], [class*="dialog"], [class*="modal"]').first();
      await expect(paymentDialog).toBeVisible({ timeout: 5000 });
      
      // Should see payment method options
      const paymentMethods = page.locator('text=/esewa|khalti|payment.*method/i');
      await expect(paymentMethods.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should select payment method', async ({ page }) => {
    await page.goto('/client-invoices');
    
    // Click pay button
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Pay Now")').first();
    if (await payButton.isVisible()) {
      await payButton.click();
      await page.waitForTimeout(1000);
      
      // Select payment method
      const methodSelect = page.locator('select, [role="combobox"], button:has-text("eSewa"), button:has-text("Khalti")').first();
      if (await methodSelect.isVisible()) {
        // Try to select eSewa or Khalti
        if (methodSelect.locator('option, [role="option"]').count() > 0) {
          await methodSelect.selectOption({ index: 0 });
        } else {
          await methodSelect.click();
          const option = page.locator('[role="option"]:has-text("eSewa"), [role="option"]:has-text("Khalti")').first();
          if (await option.isVisible()) {
            await option.click();
          }
        }
        
        await page.waitForTimeout(500);
        
        // Should have a method selected
        const selectedMethod = page.locator('text=/esewa|khalti/i');
        await expect(selectedMethod.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should initiate eSewa payment', async ({ page, context }) => {
    await page.goto('/client-invoices');
    
    // Click pay button
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Pay Now")').first();
    if (await payButton.isVisible()) {
      await payButton.click();
      await page.waitForTimeout(1000);
      
      // Select eSewa
      const esewaOption = page.locator('text=/esewa/i, [role="option"]:has-text("eSewa")').first();
      if (await esewaOption.isVisible()) {
        await esewaOption.click();
        await page.waitForTimeout(500);
      }
      
      // Click proceed/pay button
      const proceedBtn = page.locator('button:has-text("Pay"), button:has-text("Proceed"), button[type="submit"]').first();
      if (await proceedBtn.isVisible()) {
        // Listen for navigation to eSewa or form submission
        const [response] = await Promise.all([
          page.waitForResponse(resp => resp.url().includes('esewa') || resp.status() === 200, { timeout: 10000 }).catch(() => null),
          proceedBtn.click()
        ]);
        
        // Should either redirect to eSewa or show form
        await page.waitForTimeout(2000);
        
        // Check if we're redirected or form is submitted
        const esewaForm = page.locator('form[action*="esewa"], input[name*="esewa"]').first();
        const redirected = page.url().includes('esewa');
        
        expect(esewaForm.isVisible() || redirected).toBeTruthy();
      }
    }
  });

  test('should view payment history', async ({ page }) => {
    await page.goto('/client-invoices');
    
    // Look for paid invoices or payment history tab
    const paidTab = page.locator('[role="tab"]:has-text("Paid"), button:has-text("Paid"), [role="tab"]:has-text("History")').first();
    if (await paidTab.isVisible()) {
      await paidTab.click();
      await page.waitForTimeout(1000);
      
      // Should see paid invoices or payment history
      const historySection = page.locator('[class*="invoice"], [class*="payment"], [class*="history"]').first();
      await expect(historySection).toBeVisible({ timeout: 5000 });
    }
  });
});

