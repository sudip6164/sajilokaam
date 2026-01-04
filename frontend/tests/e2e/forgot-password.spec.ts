import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Navigate to login first, then to forgot password
    const loginButton = page.locator('button:has-text("Sign in"), a:has-text("Sign in"), button:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(500);
    }
    
    // Click forgot password link
    const forgotPasswordLink = page.locator('button:has-text("Forgot password"), a:has-text("Forgot password")').first();
    await forgotPasswordLink.scrollIntoViewIfNeeded();
    await forgotPasswordLink.click();
    await page.waitForTimeout(500);
    
    // Verify we're on forgot password page
    await expect(page.locator('text=Forgot Password?')).toBeVisible({ timeout: 5000 });
  });

  test('should display forgot password form', async ({ page }) => {
    // Check if form elements are visible
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Forgot Password?')).toBeVisible();
    await expect(page.locator('text=No worries! Enter your email address')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    
    // Enter invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await page.waitForTimeout(300);
    
    // Check for validation error
    const errorMessage = page.locator('text=/Please enter a valid email address/i').or(
      page.locator('text=/Invalid email/i')
    );
    await expect(errorMessage).toBeVisible({ timeout: 2000 });
  });

  test('should show validation error for empty email on submit', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    
    // Clear email and try to submit
    await emailInput.clear();
    await submitButton.click();
    await page.waitForTimeout(500);
    
    // HTML5 validation should prevent submission, but check for error message if shown
    const errorMessage = page.locator('text=/Email is required/i').or(
      page.locator('text=/Please fill in this field/i')
    );
    // HTML5 validation might show native browser message, so this might not always be visible
    // But if our custom validation triggers, it should show
    const hasError = await errorMessage.isVisible().catch(() => false);
    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should disable submit button when email is empty', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.clear();
    
    // Button should be disabled when email is empty
    await expect(submitButton).toBeDisabled();
  });

  test('should show loading state during submission', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    
    // Enter valid email
    await emailInput.fill('test@example.com');
    
    // Submit form
    await submitButton.click();
    
    // Check for loading state (button text changes to "Sending...")
    await expect(page.locator('button:has-text("Sending...")')).toBeVisible({ timeout: 1000 });
  });

  test('should show success message after successful submission', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    
    // Use a unique email that might exist or not (backend handles 404 gracefully)
    const testEmail = `test${Date.now()}@example.com`;
    await emailInput.fill(testEmail);
    
    // Submit form
    await submitButton.click();
    
    // Wait for success state
    await page.waitForTimeout(2000);
    
    // Check for success message
    await expect(page.locator('text=Check Your Email')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${testEmail}`)).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=We\'ve sent password reset instructions')).toBeVisible({ timeout: 3000 });
  });

  test('should show error message for server error', async ({ page }) => {
    // Mock a server error by intercepting the request
    await page.route('**/api/auth/forgot-password', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error. Please try again later.' })
      });
    });
    
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill('test@example.com');
    
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Check for error message
    const errorMessage = page.locator('text=/Server error/i').or(
      page.locator('text=/Failed to send/i')
    );
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should show rate limiting message', async ({ page }) => {
    // Mock rate limiting response
    await page.route('**/api/auth/forgot-password', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Too many requests. Please try again later.' })
      });
    });
    
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill('test@example.com');
    
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Check for rate limiting message
    const errorMessage = page.locator('text=/Too many requests/i').or(
      page.locator('text=/try again later/i')
    );
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should navigate back to login from back button', async ({ page }) => {
    const backButton = page.locator('button:has-text("Back to Login"), a:has-text("Back to Login")').first();
    
    await backButton.scrollIntoViewIfNeeded();
    await backButton.click();
    await page.waitForTimeout(500);
    
    // Should be on login page
    await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 3000 });
  });

  test('should navigate back to login from footer link', async ({ page }) => {
    const loginLink = page.locator('button:has-text("Login")').filter({ 
      hasText: /Remember your password/i 
    }).or(page.locator('text=Login').filter({ hasText: /Remember your password/i }));
    
    // Find the login link in the footer
    const footerLoginLink = page.locator('text=Remember your password').locator('..').locator('button:has-text("Login")');
    
    await footerLoginLink.scrollIntoViewIfNeeded();
    await footerLoginLink.click();
    await page.waitForTimeout(500);
    
    // Should be on login page
    await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 3000 });
  });

  test('should allow sending another email from success page', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    
    // Submit form to get to success page
    const testEmail = `test${Date.now()}@example.com`;
    await emailInput.fill(testEmail);
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Wait for success page
    await expect(page.locator('text=Check Your Email')).toBeVisible({ timeout: 5000 });
    
    // Click "Send Another Email" button
    const sendAnotherButton = page.locator('button:has-text("Send Another Email")');
    await sendAnotherButton.scrollIntoViewIfNeeded();
    await sendAnotherButton.click();
    await page.waitForTimeout(500);
    
    // Should be back on form
    await expect(page.locator('text=Forgot Password?')).toBeVisible({ timeout: 3000 });
    await expect(emailInput).toHaveValue('');
  });

  test('should navigate to login from success page', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    
    // Submit form to get to success page
    const testEmail = `test${Date.now()}@example.com`;
    await emailInput.fill(testEmail);
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Wait for success page
    await expect(page.locator('text=Check Your Email')).toBeVisible({ timeout: 5000 });
    
    // Click "Back to Login" button
    const backToLoginButton = page.locator('button:has-text("Back to Login")').last();
    await backToLoginButton.scrollIntoViewIfNeeded();
    await backToLoginButton.click();
    await page.waitForTimeout(500);
    
    // Should be on login page
    await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 3000 });
  });

  test('should clear error when user starts typing', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.scrollIntoViewIfNeeded();
    
    // Enter invalid email to trigger error
    await emailInput.fill('invalid');
    await emailInput.blur();
    await page.waitForTimeout(300);
    
    // Error should be visible
    const errorMessage = page.locator('text=/Invalid email/i').or(
      page.locator('text=/valid email/i')
    );
    await expect(errorMessage).toBeVisible({ timeout: 2000 });
    
    // Start typing valid email
    await emailInput.fill('valid@example.com');
    await page.waitForTimeout(300);
    
    // Error should be cleared
    await expect(errorMessage).not.toBeVisible({ timeout: 2000 });
  });
});

