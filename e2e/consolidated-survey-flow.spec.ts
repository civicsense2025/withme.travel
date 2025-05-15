/**
 * Consolidated Survey Flow Tests
 * 
 * A comprehensive suite that tests all aspects of user research surveys:
 * - Basic survey completion flow
 * - Multi-milestone surveys
 * - Accessibility compliance
 * - Keyboard navigation and focus management
 * - Performance metrics
 * - Error cases (invalid tokens, expired sessions)
 */
import { test, expect } from '@playwright/test';
import { SurveyPage } from './models/SurveyPage';
import { loadTestTokens, wait } from './utils/test-helpers.js';
import { testKeyboardNavigation, testFocusTrap } from './utils/accessibility-helpers.js';
import { startPerformanceTracking, endPerformanceTracking, reportPerformanceMetrics } from './utils/performance-helpers.js';

// Setup test tokens
let TEST_TOKENS: Record<string, string>;

// Set up the test suite
test.beforeAll(async () => {
  // Load test tokens
  TEST_TOKENS = await loadTestTokens();
  
  // Log environment information
  console.log('======= Test Environment =======');
  console.log(`- Survey Base URL: ${process.env.SURVEY_BASE_URL || 'http://localhost:3000'}`);
  console.log(`- Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'}`);
  console.log('===============================');
});

// Helper to get a consistent token for each test
function getUniqueTestToken(baseToken: string, testName: string): string {
  // Use the existing token format but make it unique to avoid collisions
  if (baseToken.includes('?')) {
    // Token already has query parameters
    return `${baseToken}&test=${encodeURIComponent(testName)}`;
  } else {
    // Add test identifier as query parameter
    return `${baseToken}?test=${encodeURIComponent(testName)}`;
  }
}

// === Basic Survey Flow Tests ===

test('completes basic survey flow successfully', async ({ page }) => {
  // Get a unique token for this test
  const token = getUniqueTestToken(TEST_TOKENS.VALID, 'basic-flow');
  
  // Create survey page object
  const surveyPage = new SurveyPage(page, { token, debug: true });
  
  // Start performance tracking
  await startPerformanceTracking(page, 'basic-survey-flow');
  
  // Load survey page
  await surveyPage.goto();
  
  // Start the survey
  await surveyPage.startSurvey();
  
  // Complete each question with default answers
  await surveyPage.completeEntireSurvey();
  
  // Verify completion
  const isComplete = await surveyPage.isCompletionScreenVisible();
  expect(isComplete).toBeTruthy();
  
  // Get confirmation code
  const confirmationCode = await surveyPage.getConfirmationCode();
  expect(confirmationCode).toBeTruthy();
  console.log(`Survey completed with confirmation code: ${confirmationCode}`);
  
  // End performance tracking and report metrics
  const metrics = await endPerformanceTracking(page);
  await reportPerformanceMetrics(metrics, 'basic-survey-flow');
});

// === Accessibility Tests ===

test('survey meets accessibility standards', async ({ page }) => {
  // Get a unique token for this test
  const token = getUniqueTestToken(TEST_TOKENS.VALID, 'accessibility');
  
  // Create survey page object
  const surveyPage = new SurveyPage(page, { token });
  
  // Load survey page
  await surveyPage.goto();
  
  // Test welcome screen accessibility
  const welcomeScreenViolations = await surveyPage.checkAccessibility();
  expect(welcomeScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
  
  // Start the survey
  await surveyPage.startSurvey();
  
  // Test question screen accessibility
  const questionScreenViolations = await surveyPage.checkAccessibility();
  expect(questionScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
  
  // Test keyboard navigation
  const keyboardNavigable = await testKeyboardNavigation(page);
  expect(keyboardNavigable).toBeTruthy();
});

// === Focus Management Tests ===

test('survey properly manages focus', async ({ page }) => {
  // Get a unique token for this test
  const token = getUniqueTestToken(TEST_TOKENS.VALID, 'focus-management');
  
  // Create survey page object
  const surveyPage = new SurveyPage(page, { token });
  
  // Load survey page
  await surveyPage.goto();
  
  // Start the survey 
  await surveyPage.startSurvey();
  
  // Navigate through questions
  await surveyPage.answerQuestion(0);
  await surveyPage.goToNextQuestion();
  
  // Ensure focus is on the question
  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).not.toBe('BODY');
  
  // Test back button focus
  await surveyPage.goToPreviousQuestion();
  const secondFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(secondFocusedElement).not.toBe('BODY');
});

// === Error Handling Tests ===

test('handles invalid token gracefully', async ({ page }) => {
  // Create survey page with invalid token
  const surveyPage = new SurveyPage(page, { 
    token: 'invalid-token-12345',
    autoValidate: false 
  });
  
  // Navigate to page
  await surveyPage.goto();
  
  // Check for error message
  const errorVisible = await page.locator('text=Error, this survey token is').isVisible();
  expect(errorVisible).toBeTruthy();
});

test('handles expired session gracefully', async ({ page }) => {
  // Use expired token if available, otherwise simulate it
  const token = TEST_TOKENS.EXPIRED || 'expired-token-12345';
  
  // Create survey page with expired token
  const surveyPage = new SurveyPage(page, { 
    token,
    autoValidate: false 
  });
  
  // Navigate to page
  await surveyPage.goto();
  
  // Check for expired session message
  const errorVisible = await page.locator('text=/expired|invalid/i').isVisible();
  expect(errorVisible).toBeTruthy();
});

// === Performance Tests ===

test('survey loads and responds within performance thresholds', async ({ page }) => {
  // Get a unique token for this test
  const token = getUniqueTestToken(TEST_TOKENS.VALID, 'performance');
  
  // Create survey page object
  const surveyPage = new SurveyPage(page, { token });
  
  // Start performance tracking
  await startPerformanceTracking(page, 'survey-performance');
  
  // Measure initial page load
  const startTime = Date.now();
  await surveyPage.goto();
  const loadTime = Date.now() - startTime;
  
  // Verify load time is reasonable
  expect(loadTime).toBeLessThan(5000); // 5 seconds max
  
  // Measure survey start time
  const startSurveyTime = Date.now();
  await surveyPage.startSurvey();
  const surveyStartTime = Date.now() - startSurveyTime;
  
  // Verify survey start time is reasonable
  expect(surveyStartTime).toBeLessThan(2000); // 2 seconds max
  
  // Measure question interaction time
  const interactionStartTime = Date.now();
  await surveyPage.answerQuestion(0);
  await surveyPage.goToNextQuestion();
  const interactionTime = Date.now() - interactionStartTime;
  
  // Verify interaction time is reasonable
  expect(interactionTime).toBeLessThan(1000); // 1 second max
  
  // End performance tracking and report metrics
  const metrics = await endPerformanceTracking(page);
  await reportPerformanceMetrics(metrics, 'survey-performance');
});

// === Combined End-to-End Flow ===

test('completes full flow with all testing dimensions', async ({ page }) => {
  // Get a unique token for this test
  const token = getUniqueTestToken(TEST_TOKENS.VALID, 'full-e2e-flow');
  
  // Create survey page object
  const surveyPage = new SurveyPage(page, { token, debug: true });
  
  // Start performance tracking
  await startPerformanceTracking(page, 'full-e2e-flow');
  
  // Load survey page
  await surveyPage.goto();
  
  // Check accessibility on welcome screen
  const welcomeScreenViolations = await surveyPage.checkAccessibility();
  expect(welcomeScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
  
  // Test keyboard navigation
  const keyboardNavigable = await testKeyboardNavigation(page);
  expect(keyboardNavigable).toBeTruthy();
  
  // Start the survey
  await surveyPage.startSurvey();
  
  // Check accessibility on first question
  const questionScreenViolations = await surveyPage.checkAccessibility();
  expect(questionScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
  
  // Complete survey with default answers
  await surveyPage.completeEntireSurvey();
  
  // Verify completion
  const isComplete = await surveyPage.isCompletionScreenVisible();
  expect(isComplete).toBeTruthy();
  
  // Check accessibility on completion screen
  const completionScreenViolations = await surveyPage.checkAccessibility();
  expect(completionScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
  
  // End performance tracking and report metrics
  const metrics = await endPerformanceTracking(page);
  await reportPerformanceMetrics(metrics, 'full-e2e-flow');
}); 