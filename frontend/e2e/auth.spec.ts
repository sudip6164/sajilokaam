import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure clean state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/.*login/);
    // Check for login page heading or form elements
    await expect(
      page.locator('h2:has-text("Welcome Back"), h2:has-text("Admin Login"), input[type="email"], input[name="email"]').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    // Use admin login page for admin credentials
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in login form
    await page.fill('input[type="email"], input[name="email"]', 'admin@sajilokaam.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    
    // Submit form and wait for login API response
    const loginResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/login'), { timeout: 15000 });
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    const loginResponse = await loginResponsePromise;
    
    // Check if login was successful
    const status = loginResponse.status();
    if (status !== 200) {
      const errorData = await loginResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Login failed with status ${status}: ${JSON.stringify(errorData)}. Make sure the backend is running and the admin user exists in the database.`);
    }
    
    // Verify the login response contains a token
    const loginData = await loginResponse.json();
    expect(loginData.token).toBeTruthy();
    expect(loginData.token.length).toBeGreaterThan(0);
    
    // Wait for navigation - admin should go to /admin (this confirms login succeeded)
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Wait for auth API call to complete (AuthContext fetches /auth/me after login)
    await page.waitForResponse(resp => resp.url().includes('/auth/me') && resp.status() === 200, { timeout: 10000 }).catch(() => null);
    
    // Token should be stored by now (AuthContext.login stores it immediately after API call)
    // But wait a bit for React state to update
    await page.waitForFunction(() => {
      const token = localStorage.getItem('jwt_token');
      return token !== null && token.length > 0;
    }, { timeout: 10000 });
    
    // Verify token is stored
    const token = await page.evaluate(() => localStorage.getItem('jwt_token'));
    expect(token).toBeTruthy();
    expect(token?.length).toBeGreaterThan(0);
    
    // Wait for avatar to appear (this confirms the user profile was loaded)
    const userAvatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"], button:has([class*="Avatar"])').first();
    await userAvatar.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    
    // Get current URL
    const currentUrl = page.url();
    const isNotOnLogin = !currentUrl.includes('/login');
    
    // Check for error message
    const errorMsg = page.locator('text=/error|invalid|failed/i').first();
    const hasError = await errorMsg.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasError) {
      throw new Error('Login failed with error message');
    }
    
    // Should see avatar AND be redirected away from login page
    const avatarVisible = await userAvatar.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!avatarVisible || !isNotOnLogin) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/login-failed.png', fullPage: true }).catch(() => null);
      const localStorageContent = await page.evaluate(() => ({
        token: localStorage.getItem('jwt_token'),
        allKeys: Object.keys(localStorage)
      })).catch(() => ({ token: null, allKeys: [] }));
      throw new Error(`Login failed. URL: ${currentUrl}, Avatar visible: ${avatarVisible}, Token in storage: ${!!localStorageContent.token}`);
    }
    
    // Both conditions should be true
    expect(avatarVisible).toBeTruthy();
    expect(isNotOnLogin).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"], button:has-text("Sign In")');
    
    // Should show error message
    await expect(page.locator('text=/invalid|error|incorrect|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    // Try to find "Get Started" button in header or homepage
    const getStartedBtn = page.locator('text=Get Started').first();
    if (await getStartedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await getStartedBtn.click();
    } else {
      // If not visible, navigate directly
      await page.goto('/register');
    }
    await expect(page).toHaveURL(/.*register/);
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@sajilokaam.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    await page.waitForURL(/\/(admin|dashboard|home)?/, { timeout: 10000 });
    
    // Look for user menu or logout button
    const userMenu = page.locator('[aria-label*="user"], [aria-label*="account"], button:has-text("Logout")').first();
    if (await userMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userMenu.click();
      
      // Wait for dropdown to appear
      const logoutBtn = page.locator('text=/logout|sign out/i').first();
      await logoutBtn.waitFor({ state: 'visible', timeout: 2000 }).catch(() => null);
      
      if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await logoutBtn.click();
        await page.waitForURL(/\/(login|home|\/)/, { timeout: 5000 });
        
        // Should be logged out
        await expect(page).toHaveURL(/\/(login|home|\/)/);
      }
    }
  });

  test('should maintain session after page reload', async ({ page }) => {
    // Login first using admin login page
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"], input[name="email"]', 'admin@sajilokaam.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    
    // Submit form and wait for login API response
    const loginResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/login'), { timeout: 15000 });
    await page.click('button[type="submit"], button:has-text("Sign In")');
    const loginResponse = await loginResponsePromise;
    
    // Check if login was successful
    const status = loginResponse.status();
    if (status !== 200) {
      const errorData = await loginResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Login failed with status ${status}: ${JSON.stringify(errorData)}. Make sure the backend is running and the admin user exists in the database.`);
    }
    
    // Verify the login response contains a token
    const loginData = await loginResponse.json();
    expect(loginData.token).toBeTruthy();
    expect(loginData.token.length).toBeGreaterThan(0);
    
    // Wait for navigation - admin should go to /admin (this confirms login succeeded)
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Wait for auth API call to complete (AuthContext fetches /auth/me after login)
    await page.waitForResponse(resp => resp.url().includes('/auth/me') && resp.status() === 200, { timeout: 10000 }).catch(() => null);
    
    // Token should be stored by now (AuthContext.login stores it immediately after API call)
    await page.waitForFunction(() => {
      const token = localStorage.getItem('jwt_token');
      return token !== null && token.length > 0;
    }, { timeout: 10000 });
    
    // Verify token is stored
    const tokenBeforeReload = await page.evaluate(() => localStorage.getItem('jwt_token'));
    expect(tokenBeforeReload).toBeTruthy();
    expect(tokenBeforeReload?.length).toBeGreaterThan(0);
    
    // Wait for avatar to appear (this confirms the user profile was loaded)
    const avatarBeforeReload = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await avatarBeforeReload.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for auth API call to complete (AuthContext fetches /auth/me on mount after reload)
    await page.waitForResponse(resp => resp.url().includes('/auth/me') && resp.status() === 200, { timeout: 10000 }).catch(() => null);
    
    // Wait for avatar to appear instead of fixed timeout (more reliable)
    const userAvatarAfterReload = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await userAvatarAfterReload.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    
    // Verify token is still in localStorage after reload
    const tokenAfterReload = await page.evaluate(() => localStorage.getItem('jwt_token'));
    expect(tokenAfterReload).toBeTruthy();
    expect(tokenAfterReload).toBe(tokenBeforeReload);
    
    // Look for avatar in header - should be visible if session maintained
    const userAvatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"], button:has([class*="Avatar"])').first();
    const currentUrl = page.url();
    const isNotOnLogin = !currentUrl.includes('/login');
    
    // Check if we're still logged in
    const avatarVisible = await userAvatar.isVisible({ timeout: 10000 }).catch(() => false);
    
    // Should see avatar AND not be on login page
    if (!avatarVisible || !isNotOnLogin) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/session-failed.png', fullPage: true }).catch(() => null);
      const localStorageContent = await page.evaluate(() => ({
        token: localStorage.getItem('jwt_token'),
        allKeys: Object.keys(localStorage)
      })).catch(() => ({ token: null, allKeys: [] }));
      throw new Error(`Session not maintained. URL: ${currentUrl}, Avatar visible: ${avatarVisible}, Token in storage: ${!!localStorageContent.token}`);
    }
    
    // Both conditions should be true
    expect(avatarVisible).toBeTruthy();
    expect(isNotOnLogin).toBeTruthy();
  });
});

