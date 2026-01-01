import { Page } from '@playwright/test';

export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@sajilokaam.com',
    password: 'admin123',
    role: 'ADMIN'
  },
  // Note: Only admin user is seeded in database
  // For tests requiring freelancer/client roles, use admin credentials
  // Admin can access most features
  freelancer: {
    email: 'admin@sajilokaam.com', // Use admin for now
    password: 'admin123',
    role: 'FREELANCER'
  },
  client: {
    email: 'admin@sajilokaam.com', // Use admin for now
    password: 'admin123',
    role: 'CLIENT'
  }
};

/**
 * Login helper function
 * Automatically uses /admin/login for admin credentials, /login for others
 * Note: Admin can also login via /login page (will redirect to /admin)
 */
export async function login(page: Page, credentials: { email: string; password: string; role?: string }, options?: { useAdminLogin?: boolean }) {
  // Determine which login page to use
  const isAdmin = credentials.email === 'admin@sajilokaam.com' || credentials.role === 'ADMIN';
  // Use /admin/login if explicitly requested or if it's admin and no override
  const useAdminPage = options?.useAdminLogin !== false && isAdmin;
  const loginUrl = useAdminPage ? '/admin/login' : '/login';
  
  await page.goto(loginUrl);
  await page.waitForLoadState('networkidle');
  
  // Fill in login form
  await page.fill('input[type="email"], input[name="email"]', credentials.email);
  await page.fill('input[type="password"], input[name="password"]', credentials.password);
  
  // Select role if there's a role selector (only on regular login page)
  if (!useAdminPage) {
    const roleSelect = page.locator('select, [role="combobox"]').first();
    if (await roleSelect.isVisible({ timeout: 2000 }).catch(() => false) && credentials.role) {
      await roleSelect.selectOption({ label: new RegExp(credentials.role, 'i') });
    }
  }
  
  // Submit form and wait for login API response
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/auth/login') && resp.status() === 200, { timeout: 10000 }).catch(() => null),
    page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")')
  ]);
  
  // Wait for navigation
  // Admin goes to /admin (from either login page), others go to home or dashboard
  const expectedUrlPattern = isAdmin 
    ? /\/admin/
    : /\/(dashboard|home|freelancer|client|\/)?/;
  await page.waitForURL(expectedUrlPattern, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  
  // Wait for auth API call to complete (AuthContext fetches /auth/me after login)
  await page.waitForResponse(resp => resp.url().includes('/auth/me') && resp.status() === 200, { timeout: 10000 }).catch(() => null);
  
  // Wait for avatar to appear instead of fixed timeout (more reliable)
  const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
  await avatar.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  
  // Verify token is stored
  const token = await page.evaluate(() => localStorage.getItem('jwt_token'));
  if (!token) {
    throw new Error('Login failed - token not stored in localStorage');
  }
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  // Look for user menu or logout button
  const userMenu = page.locator('[aria-label*="user"], [aria-label*="account"], button:has-text("Logout"), button:has-text("Sign Out")').first();
  
  if (await userMenu.isVisible()) {
    await userMenu.click();
    
    // If dropdown opens, click logout
    const logoutBtn = page.locator('text=/logout|sign out/i').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    }
  }
  
  // Wait for redirect to login or home
  await page.waitForURL(/\/(login|home|\/)/, { timeout: 5000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const userMenu = page.locator('[aria-label*="user"], [aria-label*="account"], .user-menu').first();
  return await userMenu.isVisible().catch(() => false);
}

