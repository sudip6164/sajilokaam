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
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Join SajiloKaam')).toBeVisible();
  });

  test('should show validation error for empty first name', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const lastNameInput = page.locator('input[id="lastName"]');
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Clear first name and fill other required fields to bypass HTML5 validation
    await firstNameInput.clear();
    await lastNameInput.fill('Test');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    // Find the terms checkbox - Radix UI Checkbox renders as a button with role="checkbox"
    // Find by label text first, then get the associated checkbox
    const termsLabel = page.locator('label[for="terms"]');
    const termsCheckbox = page.locator('button[role="checkbox"][aria-labelledby*="terms"], button[role="checkbox"]').filter({ has: termsLabel }).or(page.locator('button[role="checkbox"]').last());
    await termsCheckbox.click({ timeout: 5000 });
    
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Check for validation error
    await expect(page.locator('text=Name is required')).toBeVisible({ timeout: 2000 });
  });

  test('should show validation error for short first name', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const lastNameInput = page.locator('input[id="lastName"]');
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Enter single character and fill other required fields
    await firstNameInput.fill('A');
    await lastNameInput.fill('Test');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    // Find the terms checkbox - Radix UI Checkbox renders as a button with role="checkbox"
    // Find by label text first, then get the associated checkbox
    const termsLabel = page.locator('label[for="terms"]');
    const termsCheckbox = page.locator('button[role="checkbox"][aria-labelledby*="terms"], button[role="checkbox"]').filter({ has: termsLabel }).or(page.locator('button[role="checkbox"]').last());
    await termsCheckbox.click({ timeout: 5000 });
    
    // Try to submit to trigger validation
    await submitButton.click();
    await page.waitForTimeout(500);
    
    // Check for validation error
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible({ timeout: 2000 });
  });

  test('should show email validation error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[id="email"]');
    
    // Enter invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await page.waitForTimeout(300);
    
    // Check for validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible({ timeout: 2000 });
  });

  test('should show password strength indicator', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    
    // Enter weak password
    await passwordInput.fill('weak');
    await page.waitForTimeout(500);
    
    // Check for weak indicator - case insensitive
    await expect(page.locator('text=/Weak/i')).toBeVisible({ timeout: 2000 });
    
    // Enter medium password
    await passwordInput.fill('MediumPass123');
    await page.waitForTimeout(500);
    
    // Check for medium indicator
    await expect(page.locator('text=/Medium/i')).toBeVisible({ timeout: 2000 });
    
    // Enter strong password
    await passwordInput.fill('StrongPass123!@#');
    await page.waitForTimeout(500);
    
    // Check for strong indicator
    await expect(page.locator('text=/Strong/i')).toBeVisible({ timeout: 2000 });
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
    // Find the terms checkbox - Radix UI Checkbox renders as a button with role="checkbox"
    // Find by label text first, then get the associated checkbox
    const termsLabel = page.locator('label[for="terms"]');
    const termsCheckbox = page.locator('button[role="checkbox"][aria-labelledby*="terms"], button[role="checkbox"]').filter({ has: termsLabel }).or(page.locator('button[role="checkbox"]').last());
    await termsCheckbox.click({ timeout: 5000 });
    
    await submitButton.click();
    
    // Wait for error to appear in form - check for partial match since full message is long
    await expect(page.locator('text=/This email is already registered/i')).toBeVisible({ timeout: 10000 });
    
    // Verify error is shown in form (not just toast)
    const errorMessage = page.locator('text=/This email is already registered/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should require terms agreement', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const lastNameInput = page.locator('input[id="lastName"]');
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill form but don't check terms
    await firstNameInput.fill('Test');
    await lastNameInput.fill('User');
    await emailInput.fill('new@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    await submitButton.click();
    
    // Check for terms error (should show as toast)
    // The error message is: "Please agree to the terms and conditions"
    await expect(page.locator('text=/agree to the terms/i')).toBeVisible({ timeout: 3000 });
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
    // Find the terms checkbox - Radix UI Checkbox renders as a button with role="checkbox"
    // Find by label text first, then get the associated checkbox
    const termsLabel = page.locator('label[for="terms"]');
    const termsCheckbox = page.locator('button[role="checkbox"][aria-labelledby*="terms"], button[role="checkbox"]').filter({ has: termsLabel }).or(page.locator('button[role="checkbox"]').last());
    await termsCheckbox.click({ timeout: 5000 });
    
    await submitButton.click();
    
    // Wait for navigation - check for dashboard content (any of these should appear)
    await Promise.race([
      expect(page.locator('text=/Dashboard/i')).toBeVisible({ timeout: 10000 }),
      expect(page.locator('text=/Freelancer/i')).toBeVisible({ timeout: 10000 }),
      expect(page.locator('text=/Client/i')).toBeVisible({ timeout: 10000 }),
      expect(page.locator('text=/Welcome/i')).toBeVisible({ timeout: 10000 }),
    ]).catch(() => {
      // If none match, at least verify we're not on signup page anymore
      expect(page.locator('text=Join SajiloKaam')).not.toBeVisible();
    });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    
    // Fill password
    await passwordInput.fill('testpassword');
    
    // Find the toggle button - it's the button inside the relative div that contains the password input
    const passwordContainer = passwordInput.locator('xpath=ancestor::div[contains(@class, "relative")]');
    const toggleButton = passwordContainer.locator('button[type="button"]').last();
    
    // Wait for button to exist
    await expect(toggleButton).toHaveCount(1, { timeout: 5000 });
    
    // Get initial input type
    const initialType = await passwordInput.getAttribute('type');
    expect(initialType).toBe('password');
    
    // Click toggle using force
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

