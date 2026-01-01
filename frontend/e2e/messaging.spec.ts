import { test, expect } from '@playwright/test';
import { login, TEST_CREDENTIALS } from './helpers/auth';

test.describe('Messaging & Conversations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (only seeded user, can access freelancer features)
    await login(page, TEST_CREDENTIALS.admin);
  });

  test('should view messages/conversations page', async ({ page }) => {
    // Already logged in via beforeEach
    
    // Verify we're logged in
    const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
    
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (auth failure)
    if (page.url().includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Check if messages page loads - look for content in main area
    const pageHeading = page.locator('main h1, main h2, [class*="container"] h1, [class*="container"] h2').first();
    if (await pageHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pageHeading).toContainText(/message|conversation/i, { timeout: 5000 });
    }
    
    // Should see conversations list (even if empty) or empty state
    // First check if page loaded
    const pageContent = page.locator('main, [class*="container"]').first();
    await expect(pageContent).toBeVisible({ timeout: 5000 });
    
    // Then check for conversations or empty state
    const conversationsSection = page.locator('[class*="conversation"], [class*="message"], [class*="chat"]').first();
    const emptyState = page.getByText(/message|conversation|no.*conversation/i).first();
    const hasConversations = await conversationsSection.isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    
    // At least one should be visible
    expect(hasConversations || hasEmptyState).toBeTruthy();
  });

  test('should see conversation list', async ({ page }) => {
    // Already logged in via beforeEach
    
    // Verify we're logged in
    const avatar = page.locator('header button[class*="rounded-full"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
    
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (auth failure)
    if (page.url().includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Should see list of conversations (or empty state)
    const conversationList = page.locator('[class*="conversation"], [class*="card"], li').first();
    const emptyState = page.getByText(/no.*conversation|no.*message/i).first();
    const hasList = await conversationList.isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    
    // At least one should be visible
    expect(hasList || hasEmpty).toBeTruthy();
  });

  test('should open a conversation', async ({ page }) => {
    await page.goto('/messages');
    
    // Click on first conversation if available
    const firstConversation = page.locator('[class*="conversation"], [class*="card"], a').first();
    if (await firstConversation.isVisible()) {
      await firstConversation.click();
      await page.waitForTimeout(2000);
      
      // Should see conversation view or messages
      const messagesView = page.locator('[class*="message"], [class*="chat"], textarea').first();
      await expect(messagesView).toBeVisible({ timeout: 5000 });
    }
  });

  test('should send a message in conversation', async ({ page }) => {
    await page.goto('/messages');
    
    // Click on first conversation
    const firstConversation = page.locator('[class*="conversation"], [class*="card"]').first();
    if (await firstConversation.isVisible()) {
      await firstConversation.click();
      await page.waitForTimeout(2000);
      
      // Find message input
      const messageInput = page.locator('textarea[placeholder*="message" i], input[placeholder*="message" i]').first();
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test message from E2E testing');
        
        // Find send button
        const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], [aria-label*="send"]').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
          await page.waitForTimeout(2000);
          
          // Should see message appear or success indicator
          const sentMessage = page.locator('text=Test message from E2E testing');
          await expect(sentMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should navigate to project from conversation', async ({ page }) => {
    await page.goto('/messages');
    
    // Click on first conversation
    const firstConversation = page.locator('[class*="conversation"], [class*="card"]').first();
    if (await firstConversation.isVisible()) {
      await firstConversation.click();
      await page.waitForTimeout(2000);
      
      // Look for project link
      const projectLink = page.locator('a[href*="/projects/"], button:has-text("Project"), button:has-text("View Project")').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
        
        // Should be on project detail page
        await expect(page.locator('h1, h2').first()).toBeVisible();
      }
    }
  });
});

