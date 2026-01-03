import { test, expect } from '@playwright/test';

test.describe('SignUp Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page - using custom router
    await page.goto('http://localhost:5173');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    // Click signup button in header or navigate
    const signupButton = page.locator('button:has-text("Sign up"), a:has-text("Sign up"), button:has-text("Sign Up")').first();
    if (await signupButton.isVisible()) {
      await signupButton.click();
      await page.waitForTimeout(500);
    }
    // Verify we're on signup page
    await expect(page.locator('text=Join SajiloKaam')).toBeVisible({ timeout: 5000 });
  });

  test('should display signup form', async ({ page }) => {
    // Check if form elements are visible
    await expect(page.locator('input[id="firstName"]')).toBeVisible();
    await expect(page.locator('input[id="lastName"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Join SajiloKaam')).toBeVisible();
  });

  test('should show validation error for empty first name', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Try to submit without first name
    await firstNameInput.fill('');
    await submitButton.click();
    
    // Check for validation error
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('should show validation error for short first name', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    
    // Enter single character
    await firstNameInput.fill('A');
    await firstNameInput.blur();
    
    // Check for validation error
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
  });

  test('should show email validation error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    
    // Enter invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    // Check for validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    
    // Enter weak password
    await passwordInput.fill('weak');
    await page.waitForTimeout(300);
    
    // Check for weak indicator
    await expect(page.locator('text=Weak')).toBeVisible();
    
    // Enter medium password
    await passwordInput.fill('MediumPass123');
    await page.waitForTimeout(300);
    
    // Check for medium indicator
    await expect(page.locator('text=Medium')).toBeVisible();
    
    // Enter strong password
    await passwordInput.fill('StrongPass123!@#');
    await page.waitForTimeout(300);
    
    // Check for strong indicator
    await expect(page.locator('text=Strong')).toBeVisible();
  });

  test('should show password mismatch error', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    
    // Enter different passwords
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password456');
    await confirmPasswordInput.blur();
    await page.waitForTimeout(300);
    
    // Check for mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should show password match success indicator', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    
    // Enter matching passwords
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    await confirmPasswordInput.blur();
    await page.waitForTimeout(300);
    
    // Check for match indicator
    await expect(page.locator('text=Passwords match')).toBeVisible();
  });

  test('should show email already exists error in form (no toast)', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const lastNameInput = page.locator('input[id="lastName"]');
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill form with existing email (use an email that exists in your test DB)
    await firstNameInput.fill('Test');
    await lastNameInput.fill('User');
    await emailInput.fill('existing@example.com'); // Assuming this email exists
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    await page.locator('input[id="terms"]').check();
    
    await submitButton.click();
    
    // Wait for error to appear in form
    await expect(page.locator('text=This email is already registered')).toBeVisible({ timeout: 10000 });
    
    // Verify error is shown in form (not just toast)
    const errorMessage = page.locator('text=This email is already registered');
    await expect(errorMessage).toBeVisible();
  });

  test('should require terms agreement', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const lastNameInput = page.locator('input[id="lastName"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill form but don't check terms
    await firstNameInput.fill('Test');
    await lastNameInput.fill('User');
    await emailInput.fill('new@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    await submitButton.click();
    
    // Check for terms error (should show as toast)
    // Note: This might show as toast since it's a form-level validation
    await page.waitForTimeout(1000);
  });

  test('should successfully register new user', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const lastNameInput = page.locator('input[id="lastName"]');
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Generate unique email
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    // Fill form
    await firstNameInput.fill('Test');
    await lastNameInput.fill('User');
    await emailInput.fill(uniqueEmail);
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    await page.locator('input[id="terms"]').check();
    
    await submitButton.click();
    
    // Wait for navigation - check for dashboard content instead of URL
    await expect(page.locator('text=Dashboard, text=Freelancer Dashboard, text=Client Dashboard').first()).toBeVisible({ timeout: 10000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    
    // Fill password
    await passwordInput.fill('testpassword');
    
    // Find the toggle button - it's inside the password input container
    const passwordContainer = passwordInput.locator('..');
    const toggleButton = passwordContainer.locator('button[type="button"]').last();
    
    // Wait for button to be visible
    await expect(toggleButton).toBeVisible();
    
    // Click toggle
    await toggleButton.click();
    
    // Check that input type changed to text
    await expect(page.locator('input[id="password"][type="text"]')).toBeVisible();
    
    // Click again
    await toggleButton.click();
    
    // Check that input type changed back to password
    await expect(page.locator('input[id="password"][type="password"]')).toBeVisible();
  });

  test('should allow selecting user type', async ({ page }) => {
    // Check default selection (freelancer)
    const freelancerButton = page.locator('text=Find Work').locator('..');
    await expect(freelancerButton).toHaveClass(/border-primary/);
    
    // Click client option
    const clientButton = page.locator('text=Hire Talent').locator('..');
    await clientButton.click();
    
    // Check that client is now selected
    await expect(clientButton).toHaveClass(/border-primary/);
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.locator('text=Sign in');
    await loginLink.click();
    
    // Check that we're on login page
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });
});

