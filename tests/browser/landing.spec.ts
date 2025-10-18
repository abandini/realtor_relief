/**
 * Landing page browser tests
 */

import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Agent's Exclusive Access/);
  });

  test('should display main heading', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /Transform Your Market Expertise/i })
    ).toBeVisible();
  });

  test('should have working login button', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.getByRole('link', { name: /Get Started Free/i });
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('AI-Powered Content')).toBeVisible();
    await expect(page.getByText('Lead Capture Gates')).toBeVisible();
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
  });

  test('should have navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByText('Agent\'s Exclusive Access')).toBeVisible();
  });
});
