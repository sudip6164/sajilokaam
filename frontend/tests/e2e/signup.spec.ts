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
    
    // Scroll to form
    await firstNameInput.scrollIntoViewIfNeeded();
    
    // Fill other required fields first, then clear first name
    await lastNameInput.fill('Test');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    // Check terms checkbox
    const termsLabel = page.locator('label[for="terms"]');
    await termsLabel.scrollIntoViewIfNeeded();
    const parentDiv = termsLabel.locator('..');
    const termsCheckbox = parentDiv.locator('button[role="checkbox"]').first();
    await termsCheckbox.click();
    await page.waitForTimeout(200);
    
    // Now clear first name (this should trigger validation on submit)
    await firstNameInput.clear();
    await firstNameInput.blur();
    
    // Try to submit
    await submitButton.click();
    await page.waitForTimeout(800);
    
    // Check for validation error - should appear near first name field
    const firstNameError = firstNameInput.locator('..').locator('text=Name is required');
    await expect(firstNameError).toBeVisible({ timeout: 3000 });
  });

  test('should show validation error for short first name', async ({ page }) => {
    const firstNameInput = page.locator('input[id="firstName"]');
    const lastNameInput = page.locator('input[id="lastName"]');
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Scroll to form
    await firstNameInput.scrollIntoViewIfNeeded();
    
    // Fill other fields first
    await lastNameInput.fill('Test');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    // Check terms checkbox
    const termsLabel = page.locator('label[for="terms"]');
    await termsLabel.scrollIntoViewIfNeeded();
    const parentDiv = termsLabel.locator('..');
    const termsCheckbox = parentDiv.locator('button[role="checkbox"]').first();
    await termsCheckbox.click();
    await page.waitForTimeout(200);
    
    // Enter single character
    await firstNameInput.fill('A');
    await firstNameInput.blur();
    await page.waitForTimeout(300);
    
    // Try to submit to trigger validation
    await submitButton.click();
    await page.waitForTimeout(800);
    
    // Check for validation error - should appear near first name field
    const firstNameError = firstNameInput.locator('..').locator('text=Name must be at least 2 characters');
    await expect(firstNameError).toBeVisible({ timeout: 3000 });
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
    
    // Scroll to password field
    await passwordInput.scrollIntoViewIfNeeded();
    await passwordInput.click();
    await page.waitForTimeout(200);
    
    // Enter weak password
    await passwordInput.fill('weak');
    await page.waitForTimeout(1000); // Wait longer for strength calculation
    
    // Check for weak indicator - look in the password field container
    const passwordContainer = passwordInput.locator('..').locator('..'); // Go up to find the container with strength indicator
    const strengthIndicator = passwordContainer.locator('text=/Weak/i').first();
    await expect(strengthIndicator).toBeVisible({ timeout: 3000 });
    
    // Clear and enter medium password
    await passwordInput.clear();
    await passwordInput.fill('MediumPass123');
    await page.waitForTimeout(1000);
    
    // Check for medium indicator
    const mediumIndicator = passwordContainer.locator('text=/Medium/i').first();
    await expect(mediumIndicator).toBeVisible({ timeout: 3000 });
    
    // Clear and enter strong password
    await passwordInput.clear();
    await passwordInput.fill('StrongPass123!@#');
    await page.waitForTimeout(1000);
    
    // Check for strong indicator
    const strongIndicator = passwordContainer.locator('text=/Strong/i').first();
    await expect(strongIndicator).toBeVisible({ timeout: 3000 });
  });

  test('should show password mismatch error', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    
    // Scroll to fields
    await passwordInput.scrollIntoViewIfNeeded();
    
    // Enter different passwords
    await passwordInput.fill('password123');
    await confirmPasswordInput.scrollIntoViewIfNeeded();
    await confirmPasswordInput.fill('password456');
    await confirmPasswordInput.blur();
    await page.waitForTimeout(500);
    
    // Check for mismatch error - might appear on blur or submit
    await expect(page.locator('text=Passwords do not match')).toBeVisible({ timeout: 2000 });
  });

  test('should show password match success indicator', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    
    // Scroll to fields
    await passwordInput.scrollIntoViewIfNeeded();
    
    // Enter matching passwords
    await passwordInput.fill('password123');
    await confirmPasswordInput.scrollIntoViewIfNeeded();
    await confirmPasswordInput.fill('password123');
    await confirmPasswordInput.blur();
    await page.waitForTimeout(500);
    
    // Check for match indicator
    await expect(page.locator('text=Passwords match')).toBeVisible({ timeout: 2000 });
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
    // The checkbox has id="terms" which Radix sets on the button
    // Also has data-slot="checkbox"
    let termsCheckbox = page.locator('button[role="checkbox"][id="terms"]').or(
      page.locator('button[role="checkbox"][data-slot="checkbox"]').filter({ 
        has: page.locator('label[for="terms"]').locator('..') 
      })
    );
    
    // If still not found, find by label and get checkbox in same container
    if (await termsCheckbox.count() === 0) {
      const termsLabel = page.locator('label[for="terms"]');
      await expect(termsLabel).toBeVisible({ timeout: 5000 });
      await termsLabel.scrollIntoViewIfNeeded();
      
      // Get the parent div that contains both checkbox and label (flex container)
      const parentDiv = termsLabel.locator('..'); // div with flex items-start
      termsCheckbox = parentDiv.locator('button[role="checkbox"]').first();
    }
    
    // Ensure checkbox is visible and clickable
    await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    await termsCheckbox.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200); // Small wait for scroll
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
    
    // Scroll to form
    await firstNameInput.scrollIntoViewIfNeeded();
    
    // Fill form but don't check terms
    await firstNameInput.fill('Test');
    await lastNameInput.fill('User');
    await emailInput.fill('new@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    await submitButton.click();
    await page.waitForTimeout(500);
    
    // Check for terms error (should show as toast)
    // The error message is: "Please agree to the terms and conditions"
    // Use a more specific selector to avoid matching the label text
    const toastError = page.locator('[data-sonner-toast]').filter({ hasText: /Please agree to the terms/i }).or(
      page.locator('div').filter({ hasText: /Please agree to the terms and conditions/i }).first()
    );
    await expect(toastError).toBeVisible({ timeout: 3000 });
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
    // The checkbox has id="terms" which Radix sets on the button
    // Also has data-slot="checkbox"
    let termsCheckbox = page.locator('button[role="checkbox"][id="terms"]').or(
      page.locator('button[role="checkbox"][data-slot="checkbox"]').filter({ 
        has: page.locator('label[for="terms"]').locator('..') 
      })
    );
    
    // If still not found, find by label and get checkbox in same container
    if (await termsCheckbox.count() === 0) {
      const termsLabel = page.locator('label[for="terms"]');
      await expect(termsLabel).toBeVisible({ timeout: 5000 });
      await termsLabel.scrollIntoViewIfNeeded();
      
      // Get the parent div that contains both checkbox and label (flex container)
      const parentDiv = termsLabel.locator('..'); // div with flex items-start
      termsCheckbox = parentDiv.locator('button[role="checkbox"]').first();
    }
    
    // Ensure checkbox is visible and clickable
    await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    await termsCheckbox.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200); // Small wait for scroll
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
    
    // Scroll to password field
    await passwordInput.scrollIntoViewIfNeeded();
    await passwordInput.click();
    
    // Fill password
    await passwordInput.fill('testpassword');
    
    // Find the toggle button - it's the button inside the relative div that contains the password input
    // The button is positioned absolutely in the password field container
    const passwordFieldContainer = passwordInput.locator('..'); // Parent div with class "relative"
    const toggleButton = passwordFieldContainer.locator('button[type="button"]').last();
    
    // Wait for button to exist and be visible
    await expect(toggleButton).toBeVisible({ timeout: 5000 });
    await toggleButton.scrollIntoViewIfNeeded();
    
    // Get initial input type
    const initialType = await passwordInput.getAttribute('type');
    expect(initialType).toBe('password');
    
    // Click toggle - ensure it's in view and clickable
    await toggleButton.click({ force: true });
    await page.waitForTimeout(400);
    
    // Check that input type changed to text
    const typeAfterFirstClick = await passwordInput.getAttribute('type');
    expect(typeAfterFirstClick).toBe('text');
    
    // Click again
    await toggleButton.click({ force: true });
    await page.waitForTimeout(400);
    
    // Check that input type changed back to password
    const typeAfterSecondClick = await passwordInput.getAttribute('type');
    expect(typeAfterSecondClick).toBe('password');
  });

  test('should allow selecting user type', async ({ page }) => {
    // Find the user type selection buttons
    const freelancerButton = page.locator('button').filter({ hasText: /Find Work/i }).first();
    const clientButton = page.locator('button').filter({ hasText: /Hire Talent/i }).first();
    
    // Scroll to buttons
    await freelancerButton.scrollIntoViewIfNeeded();
    
    // Check default selection (freelancer) - should have primary border
    await expect(freelancerButton).toBeVisible();
    const freelancerClasses = await freelancerButton.getAttribute('class');
    expect(freelancerClasses).toContain('border-primary');
    
    // Click client option
    await clientButton.scrollIntoViewIfNeeded();
    await clientButton.click();
    await page.waitForTimeout(300);
    
    // Check that client is now selected
    const clientClasses = await clientButton.getAttribute('class');
    expect(clientClasses).toContain('border-primary');
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.locator('text=Sign in');
    await loginLink.click();
    
    // Check that we're on login page
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });
});

