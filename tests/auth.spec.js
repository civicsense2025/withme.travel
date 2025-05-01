/**
 * Authentication Tests
 *
 * These tests validate the authentication flow through the UI using Playwright.
 * The tests cover login, registration, and error handling.
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';
const INVALID_EMAIL = 'invalid@example.com';
const INVALID_PASSWORD = 'wrongpassword';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage before each test
    await page.context().clearCookies();

    // Clear localStorage auth tokens
    await page.evaluate(() => {
      try {
        localStorage.removeItem('supabase-auth-token');
        sessionStorage.removeItem('supabase-auth-token');
      } catch (e) {}
    });
  });

  // Add a debug test to see what's on the login page
  test('debug: capture login page structure', async ({ page }) => {
    await page.goto('/login');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Log the page title
    console.log('Page title:', await page.title());

    // Capture and log all buttons on the page
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);

    for (const button of buttons) {
      const text = await button.textContent();
      console.log(`Button text: "${text}"`);
    }

    // Capture and log all form elements and labels
    const formElements = await page.locator('form').all();
    console.log(`Found ${formElements.length} forms on page`);

    const labels = await page.locator('label').all();
    console.log(`Found ${labels.length} labels on page`);

    for (const label of labels) {
      const text = await label.textContent();
      console.log(`Label text: "${text}"`);
    }

    // Log the DOM structure for debugging
    const html = await page.content();
    console.log(`Page HTML (first 500 chars): ${html.substring(0, 500)}...`);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/login-page-debug.png', fullPage: true });
  });

  test('shows login form', async ({ page }) => {
    await page.goto('/login');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Check for email and password inputs based on actual DOM structure
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Check for "sign in with google" button
    await expect(page.locator('button:has-text("sign in with google")')).toBeVisible();

    // Check for main sign in button
    await expect(page.locator('button[type="submit"]:has-text("sign in")')).toBeVisible();

    // Check for "forgot password" link
    await expect(page.locator('a:has-text("forgot password?")')).toBeVisible();
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Find and click the submit button (the one that's not the Google sign-in button)
    await page.locator('button[type="submit"]:has-text("sign in")').click();

    // Wait for form validation errors to appear
    await page.waitForTimeout(500);

    // Either a browser validation error will show or a custom error message
    // Let's check if form validation prevents submission first
    const emailInput = page.locator('input[name="email"]');
    const isEmailValid = await emailInput.evaluate((el) => el.validity.valid);

    if (!isEmailValid) {
      console.log('Browser validation caught empty email');
    } else {
      // If browser validation didn't catch it, look for custom error text
      await expect(page.locator('.text-destructive')).toBeVisible();
    }
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill the form with invalid credentials
    await page.locator('input[name="email"]').fill(INVALID_EMAIL);
    await page.locator('input[name="password"]').fill(INVALID_PASSWORD);

    // Submit the form
    await page.locator('button[type="submit"]:has-text("sign in")').click();

    // Look for the error message - most likely in a div with role="alert"
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('redirects after successful login', async ({ page }) => {
    // Skip this test if no valid credentials are provided
    test.skip(
      !process.env.TEST_EMAIL || !process.env.TEST_PASSWORD,
      'Skipped because no valid test credentials provided (use TEST_EMAIL and TEST_PASSWORD env vars)'
    );

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill the form with valid credentials
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);

    // Submit the form
    await page.locator('button[type="submit"]:has-text("sign in")').click();

    // Wait for navigation - we know from login-form.tsx that it redirects to whatever is in redirectPath
    // or defaults to '/' - so check for any navigation away from login
    await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
  });

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check that password is initially hidden
    const passwordInput = page.locator('input[name="password"]');
    expect(await passwordInput.getAttribute('type')).toBe('password');

    // Click the eye icon button (it's inside the password input container)
    await page.locator('button.right-0').click();

    // Check that password is now visible
    expect(await passwordInput.getAttribute('type')).toBe('text');

    // Click again to hide
    await page.locator('button.right-0').click();

    // Check that password is hidden again
    expect(await passwordInput.getAttribute('type')).toBe('password');
  });

  test('navigates to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click the forgot password link
    await page.locator('a:has-text("forgot password?")').click();

    // Check that we're navigated to the forgot password page
    await expect(page).toHaveURL(/forgot-password/);
  });
});

// Update registration flow tests with more reliable selectors
test.describe('Registration Flow', () => {
  test('shows registration form', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Debug: take screenshot for inspection
    await page.screenshot({ path: 'test-results/signup-page-debug.png' });

    // Look for any heading that might indicate signup form with more flexibility
    await expect(
      page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /sign up|create|register|account/i })
    ).toBeVisible();

    // Check for form inputs more generically
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Look for submit button that likely contains signup text
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  // Add more registration tests as needed
});
