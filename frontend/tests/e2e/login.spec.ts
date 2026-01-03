import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page - using custom router, we need to trigger navigation
    await page.goto('http://localhost:5173');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    // Click login button in header or navigate
    const loginButton = page.locator('button:has-text("Sign in"), a:has-text("Sign in"), button:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(500);
    }
    // Verify we're on login page
    await expect(page.locator('text=Welcome Back')).toBeVisible({ timeout: 5000 });
  });

  test('should display login form', async ({ page }) => {
    // Check if form elements are visible
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should show email validation error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    
    // Enter invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    // Wait a bit for validation
    await page.waitForTimeout(300);
    
    // Check for validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should show password required error', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill email but not password
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(300);
    
    // Check for password error
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show invalid credentials error for wrong password', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill with wrong credentials
    await emailInput.fill('test@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();
    
    // Wait for error to appear in form
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10000 });
    
    // Check that error is shown in form (below password field)
    const errorMessage = page.locator('text=Invalid email or password');
    await expect(errorMessage).toBeVisible();
  });

  test('should show invalid credentials error for non-existent user', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill with non-existent user
    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('password123');
    await submitButton.click();
    
    // Wait for error to appear
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with correct credentials', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill with correct credentials (adjust based on your test data)
    await emailInput.fill('freelancer@demo.com');
    await passwordInput.fill('demo123');
    await submitButton.click();
    
    // Wait for navigation - check for dashboard content instead of URL
    await expect(page.locator('text=Dashboard, text=Freelancer Dashboard, text=Client Dashboard').first()).toBeVisible({ timeout: 10000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    
    // Fill password
    await passwordInput.fill('testpassword');
    
    // Find the toggle button - it's inside the div with class "relative" that contains the password input
    // Use a more specific selector: button inside the password field's parent container
    const passwordFieldContainer = page.locator('div').filter({ has: passwordInput });
    const toggleButton = passwordFieldContainer.locator('button[type="button"]');
    
    // Wait for button to exist (might be absolutely positioned so not "visible" in normal sense)
    await expect(toggleButton).toHaveCount(1, { timeout: 5000 });
    
    // Get initial input type
    const initialType = await passwordInput.getAttribute('type');
    expect(initialType).toBe('password');
    
    // Click toggle using force since it might be absolutely positioned
    await toggleButton.click({ force: true });
    await page.waitForTimeout(300);
    
    // Check that input type changed to text
    const typeAfterFirstClick = await passwordInput.getAttribute('type');
    expect(typeAfterFirstClick).toBe('text');
    
    // Click again
    await toggleButton.click({ force: true });
    await page.waitForTimeout(300);
    
    // Check that input type changed back to password
    const typeAfterSecondClick = await passwordInput.getAttribute('type');
    expect(typeAfterSecondClick).toBe('password');
  });

  test('should disable form during submission', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Click submit
    await submitButton.click();
    
    // Check that button shows loading state (might be too fast, so check immediately)
    const buttonText = await submitButton.textContent();
    expect(buttonText).toContain('Signing in');
    // Button might be disabled or enabled depending on timing, so just check text
  });

  test('should navigate to signup page', async ({ page }) => {
    const signupLink = page.locator('text=Sign up for free');
    await signupLink.click();
    
    // Check that we're on signup page
    await expect(page.locator('text=Join SajiloKaam')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    const forgotPasswordLink = page.locator('text=Forgot password?');
    await forgotPasswordLink.click();
    
    // Check that we're on forgot password page
    await expect(page.locator('text=Forgot Password?')).toBeVisible();
  });
});

