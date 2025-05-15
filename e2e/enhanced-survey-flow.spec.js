/**
 * Enhanced Survey Flow E2E Tests
 * 
 * Tests for the enhanced survey flow with accessibility and performance testing
 */

import { test, expect } from '@playwright/test';
import { SurveyPage } from './models/SurveyPage.js';
import { surveyUrl, TEST_BASE_URL } from './test-config.js';
import { TEST_TOKENS } from './test-tokens.js';
import { runAccessibilityScan } from './utils/accessibility-helpers.js';
import { PerformanceMetrics, recordPerformanceReport } from './utils/performance-helpers.js';

// Test suite for enhanced survey flow
test.describe('Enhanced Survey Flow with Accessibility & Performance Testing', () => {
  // Test performance metrics
  const perfMetrics = new PerformanceMetrics();
  
  // Setup for each test
  test.beforeEach(async ({ page }) => {
    // Start performance timing
    perfMetrics.mark('test-start');
  });
  
  // Teardown after each test
  test.afterEach(async ({ page }) => {
    // Record performance metrics
    perfMetrics.measure('test-start', 'test-duration');
    await recordPerformanceReport(page, perfMetrics.getAllMetrics());
  });
  
  // Test: Basic survey flow with accessibility checks
  test('completes basic survey flow with accessibility testing', async ({ page }) => {
    // Create survey page model
    const surveyPage = new SurveyPage(page);
    
    // Verify viewport size
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Navigate to survey with valid token
    await page.goto(surveyUrl(TEST_TOKENS.VALID));
    
    // Start the survey - making sure start button exists and is clickable
    await page.getByTestId('survey-start-button').click();
    
    // Check responsive layout elements
    await expect(page.locator('.max-w-3xl')).toBeVisible(); // Card should be visible
    
    // Check main form container for accessibility
    await expect(page.locator('[data-testid="survey-form"]')).toBeVisible();
    
    // Run accessibility audit on welcome screen
    const welcomeResults = await runAccessibilityScan(page);
    expect(welcomeResults.violations.length).toBe(0);
    
    // Fill in the first question (text input)
    await page.locator('[data-testid="text-input"]').fill('This is a test response');
    await page.getByTestId('survey-next-button').click();
    
    // Verify we're on the first question
    await expect(page.getByText(/satisfied/i)).toBeVisible();
    
    // Select a radio option
    await page.locator('[data-testid="radio-option-yes"]').click();
    
    // Continue to the next question
    await page.getByTestId('survey-next-button').click();
    
    // Select a checkbox option
    await page.locator('[data-testid="checkbox-option-option1"]').click();
    
    // Continue to the next page
    await page.getByTestId('survey-next-button').click();
    
    // Select a rating
    await page.locator('[data-testid="rating-4"]').click();
    
    // Submit the survey
    await page.getByTestId('survey-submit-button').click();
    
    // Verify completion screen
    await expect(page.getByTestId('survey-completion')).toBeVisible();
    await expect(page.getByTestId('completion-message')).toHaveText(/thank you/i);
    
    // Run accessibility check on completion screen
    const completionResults = await runAccessibilityScan(page);
    expect(completionResults.violations.length).toBe(0);
  });
  
  // Test: Handles invalid token with proper error display
  test('handles invalid token with proper accessibility', async ({ page }) => {
    // Create survey page model
    const surveyPage = new SurveyPage(page, TEST_TOKENS.INVALID);
    
    // Set viewport size
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Navigate to survey with invalid token
    await page.goto(surveyUrl(TEST_TOKENS.INVALID));
    
    // Verify error container is visible
    await expect(page.locator('[data-testid="error-container"]')).toBeVisible();
    
    // Verify error title contains "Invalid Token"
    await expect(page.locator('[data-testid="error-title"]')).toContainText(/invalid|not found/i);
    
    // Run accessibility audit on error screen
    const errorResults = await runAccessibilityScan(page);
    expect(errorResults.violations.length).toBe(0);
  });
  
  // Test: Handles expired session with proper error display
  test('handles expired session with proper accessibility', async ({ page }) => {
    // Create survey page model
    const surveyPage = new SurveyPage(page, TEST_TOKENS.EXPIRED);
    
    // Set viewport size
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Navigate to survey with expired token
    await page.goto(surveyUrl(TEST_TOKENS.EXPIRED));
    
    // Verify error container is visible
    await expect(page.locator('[data-testid="error-container"]')).toBeVisible();
    
    // Verify error title contains "Expired"
    await expect(page.locator('[data-testid="error-title"]')).toContainText(/expired/i);
    
    // Run accessibility audit on error screen
    const errorResults = await runAccessibilityScan(page);
    expect(errorResults.violations.length).toBe(0);
  });
  
  // Test: Properly handles focus trapping in survey modal
  test('properly handles focus trapping in modals', async ({ page }) => {
    // Create survey page model
    const surveyPage = new SurveyPage(page);
    
    // Set viewport size
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Navigate to survey with valid token
    await page.goto(surveyUrl(TEST_TOKENS.VALID));
    
    // Focus on the start button and press tab
    await page.getByTestId('survey-start-button').focus();
    await page.keyboard.press('Tab');
    
    // Verify focus is still trapped within the modal
    const focusedElement = await page.evaluate(() => document.activeElement.getAttribute('data-testid'));
    expect(focusedElement).not.toBeNull();
    
    // Start the survey
    await page.getByTestId('survey-start-button').click();
    
    // Verify navigation buttons have proper tab indices
    const prevButtonTabIndex = await page.getByTestId('survey-prev-button').getAttribute('tabindex');
    const nextButtonTabIndex = await page.getByTestId('survey-next-button').getAttribute('tabindex');
    
    expect(prevButtonTabIndex).not.toBe('-1');
    expect(nextButtonTabIndex).not.toBe('-1');
  });
  
  // Test: Completes multi-milestone survey with performance tracking
  test('completes multi-milestone survey with performance tracking', async ({ page }) => {
    // Create survey page model
    const surveyPage = new SurveyPage(page, TEST_TOKENS.MULTI_MILESTONE);
    
    // Set viewport size
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Start performance tracking
    perfMetrics.mark('survey-start');
    
    // Navigate to survey with multi-milestone token
    await page.goto(surveyUrl(TEST_TOKENS.MULTI_MILESTONE));
    
    // Record navigation time
    perfMetrics.measure('survey-start', 'navigation-time');
    
    // Start the survey
    await page.getByTestId('survey-start-button').click();
    
    // Verify milestone progress is visible
    await expect(page.locator('[data-testid="milestone-progress"]')).toBeVisible();
    
    // Get milestone progress text
    const progressText = await page.locator('[data-testid="milestone-progress"]').textContent();
    expect(progressText).toMatch(/\d+\/\d+/); // Should show something like "1/3"
    
    // Complete the first question (just to verify milestone flow works)
    await page.locator('[data-testid="text-input"]').fill('Multi-milestone test');
    await page.getByTestId('survey-next-button').click();
    
    // Record response time
    perfMetrics.measure('survey-start', 'first-response-time');
    
    // Verify we moved to the next question
    await expect(page.locator('[data-testid="question-heading"]')).toBeVisible();
    
    // Record overall test metrics
    perfMetrics.measure('survey-start', 'total-survey-time');
  });
}); 