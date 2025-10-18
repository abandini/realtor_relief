/**
 * Login page browser tests
 */

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Email address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Magic Link/i })).toBeVisible();
  });

  test('should require email input', async ({ page }) => {
    await page.goto('/login');
    const submitButton = page.getByRole('button', { name: /Send Magic Link/i });
    await submitButton.click();

    // Form should not submit without email (HTML5 validation)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should accept email input', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.getByPlaceholder(/Email address/i);
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should show success message after submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/Email address/i).fill('test@example.com');
    await page.getByRole('button', { name: /Send Magic Link/i }).click();

    // Should redirect with message
    await expect(page).toHaveURL(/\/login\?message=/);
    await expect(page.getByText(/Check your email/i)).toBeVisible();
  });

  test('should display error messages', async ({ page }) => {
    await page.goto('/login?error=Test%20error%20message');
    await expect(page.getByText('Test error message')).toBeVisible();
  });
});
