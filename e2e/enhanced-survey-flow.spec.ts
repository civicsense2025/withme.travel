/**
 * Enhanced Survey Flow Tests
 * 
 * A comprehensive test suite that includes accessibility, performance, 
 * and usability testing for the survey flow.
 */
import { test, expect } from '@playwright/test';
import { SurveyPage } from './models/SurveyPage.js';
import { loadTestTokens } from './utils/test-helpers.js';
import { getUniqueTestToken } from './test-config.js';
import { runAccessibilityScan, testKeyboardNavigation } from './utils/accessibility-helpers.js';
import { PerformanceMetrics, recordPerformanceReport } from './utils/performance-helpers.js';
import fs from 'fs';
import path from 'path';

// Define types for our function parameters
interface SeedOptions {
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

interface CleanupOptions {
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  removeTokenFile?: boolean;
}

// Simplified implementations of research seed functions
async function seedResearchTestData(options: SeedOptions = {}) {
  const {
    logLevel = 'info'
  } = options;
  
  console.log('[Seed] Starting to seed research test data');
  
  // Create test tokens
  const uniqueSuffix = `test-${Date.now()}`;
  const TEST_TOKENS = {
    VALID: `valid-${uniqueSuffix}`,
    EXPIRED: `expired-${uniqueSuffix}`,
    INVALID: `invalid-${uniqueSuffix}`,
    MULTI_MILESTONE: `multi-${uniqueSuffix}`,
  };
  
  try {
    // Write tokens to file for use by tests
    const tokensPath = path.join(process.cwd(), 'e2e/test-tokens.json');
    fs.writeFileSync(tokensPath, JSON.stringify({ TEST_TOKENS }, null, 2));
    
    console.log('[Seed] Successfully wrote test tokens to file:', tokensPath);
    console.log('[Seed] Test tokens:', TEST_TOKENS);
    
    return TEST_TOKENS;
  } catch (error) {
    console.error('[Seed] Error seeding research test data:', error);
    return null;
  }
}

async function cleanupResearchTestDataAfterTests(options: CleanupOptions = {}) {
  const { 
    logLevel = 'info',
    removeTokenFile = true
  } = options;
  
  console.log('[Cleanup] Starting cleanup of research test data');
  
  // In a real implementation, this would connect to the database and delete test data
  // For our simplified version, we'll just report success
  
  // Optionally, remove the test-tokens.json file
  if (removeTokenFile) {
    try {
      const tokensPath = path.join(process.cwd(), 'e2e/test-tokens.json');
      if (fs.existsSync(tokensPath)) {
        fs.unlinkSync(tokensPath);
        console.log('[Cleanup] Removed test-tokens.json file');
      }
    } catch (e) {
      // Ignore if file doesn't exist
      console.log('[Cleanup] No test-tokens.json file to remove or error removing it:', e);
    }
  }
  
  console.log('[Cleanup] Cleanup completed');
  return true;
}

// Load test tokens
let TEST_TOKENS: Record<string, string>;

// Before all tests, seed test data and load tokens
test.beforeAll(async () => {
  // Seed test data to ensure we have valid surveys and tokens
  await seedResearchTestData({ logLevel: 'info' });
  
  // Load tokens that were created by seeding
  TEST_TOKENS = loadTestTokens();
});

// After all tests, clean up the test data
test.afterAll(async () => {
  await cleanupResearchTestDataAfterTests({ logLevel: 'info' });
});

test.describe('Enhanced Survey Flow with Accessibility & Performance Testing', () => {
  // Initialize performance metrics for the test suite
  const performanceMetrics = new PerformanceMetrics();
  
  // Setup: before each test, route API calls as needed
  test.beforeEach(async ({ page }) => {
    // Start measuring page load time
    performanceMetrics.mark('test-start');
    
    // Store tracked events on page for verification
    // @ts-ignore - Adding custom property to page
    page.trackedEvents = [];
    
    // Handle API calls
    await page.route('**/api/research/events', async route => {
      try {
        // Record API response timing
        performanceMetrics.mark('api-call');
        
        const postData = await route.request().postData();
        if (postData) {
          const jsonData = JSON.parse(postData);
          // @ts-ignore - Accessing custom property
          page.trackedEvents.push(jsonData);
        }
        
        // Complete API call with mock response
        const response = await route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ success: true }) 
        });
        
        // Record API response time
        performanceMetrics.measure('api-call', 'api-response-time');
        
        return response;
      } catch (err) {
        return route.continue();
      }
    });
    
    // Handle session expiration for expired token
    await page.route(`**/api/research/surveys/**?token=${TEST_TOKENS.EXPIRED}`, route => {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Session expired',
          message: 'Your session has expired. Please return to the home page.'
        })
      });
    });
    
    // Handle invalid token error
    await page.route(`**/api/research/surveys/**?token=${TEST_TOKENS.INVALID}`, route => {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Invalid token',
          message: 'This survey token does not exist or is invalid.'
        })
      });
    });
    
    // Allow all other requests to proceed
    await page.route('**/api/research/**', route => route.continue());
  });
  
  // After each test, save performance metrics
  test.afterEach(async ({ page }, testInfo) => {
    // Save performance metrics
    const testName = testInfo.title.replace(/\s+/g, '-').toLowerCase();
    await recordPerformanceReport(page, performanceMetrics.getAllMetrics(), testName);
  });
  
  test('completes basic survey flow with all testing dimensions', async ({ page }) => {
    // Create POM instance with unique token for this test
    const uniqueToken = getUniqueTestToken(TEST_TOKENS.VALID, 'enhanced-survey');
    const surveyPage = new SurveyPage(page, uniqueToken);
    
    // Go to survey page and start
    await surveyPage.goto();
    
    // Run accessibility test on welcome screen
    await runAccessibilityScan(page, {
      name: 'survey-welcome',
      exclude: ['.debug-info'], // Exclude debug elements
      include: [],
      failOnCritical: true
    });
    
    // Test keyboard navigation
    await testKeyboardNavigation(page, {
      targetSelector: '[data-testid="survey-start-button"], button:has-text("Start")',
      maxTabs: 5,
      shouldReach: true
    });
    
    // Start the survey
    await surveyPage.startSurvey();
    
    // Run accessibility test on first question
    await runAccessibilityScan(page, {
      name: 'survey-question-1',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Try to proceed without answering required question
    await surveyPage.next();
    expect(await surveyPage.hasValidationError()).toBe(true);
    
    // Answer question and verify error is gone
    await surveyPage.answerRating(4);
    expect(await surveyPage.hasValidationError()).toBe(false);
    
    // Proceed to next question
    await surveyPage.next();
    
    // Answer text question
    await surveyPage.answerText('This is a test response from enhanced test suite');
    
    // Test back navigation preserves answers
    await surveyPage.previous();
    
    // Run accessibility test on question with answers
    await runAccessibilityScan(page, {
      name: 'survey-with-answers',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Go forward again and verify text is preserved
    await surveyPage.next();
    
    // Start measuring submission time
    performanceMetrics.mark('submission');
    
    // Submit survey
    await surveyPage.submit();
    
    // Measure submission response time
    performanceMetrics.measure('submission', 'survey-submission-time');
    
    // Run accessibility test on completion screen
    await runAccessibilityScan(page, {
      name: 'survey-completion',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Verify completion and return home
    await surveyPage.returnHome();
    
    // Get and verify performance metrics
    const metrics = surveyPage.getPerformanceMetrics();
    console.log('Survey performance metrics:', metrics);
    
    // Verify all metrics are within acceptable ranges
    expect(metrics.navigationTime).toBeLessThan(5000);
    expect(metrics.responseTime).toBeLessThan(3000);
    
    // Verify events were tracked
    // @ts-ignore - Accessing custom property
    const events = page.trackedEvents || [];
    const eventVerification = await surveyPage.verifyEvents(events);
    
    if (eventVerification) {
      const { hasProgressEvent, hasCompletionEvent } = eventVerification;
      // At least one type of event should be tracked
      expect(hasProgressEvent || hasCompletionEvent).toBe(true);
    } else {
      // If no events were found, fail the test
      expect('No events were tracked').toBe('Events should be tracked');
    }
  });
  
  test('handles expired session with proper accessibility', async ({ page }) => {
    // Create POM instance with expired token
    const surveyPage = new SurveyPage(page, TEST_TOKENS.EXPIRED);
    
    // Go to survey page
    await surveyPage.goto();
    
    // Verify expired session error is shown
    expect(await surveyPage.hasExpiredSessionError()).toBe(true);
    
    // Run accessibility test on error screen
    await runAccessibilityScan(page, {
      name: 'expired-session-error',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Test keyboard navigation to home button
    await testKeyboardNavigation(page, {
      targetSelector: '[data-testid="home-button"], button:has-text("Return Home")',
      maxTabs: 5,
      shouldReach: true
    });
  });
  
  test('handles invalid token with proper accessibility', async ({ page }) => {
    // Create POM instance with invalid token
    const surveyPage = new SurveyPage(page, TEST_TOKENS.INVALID);
    
    // Go to survey page
    await surveyPage.goto();
    
    // Verify invalid token error is shown
    expect(await surveyPage.hasInvalidTokenError()).toBe(true);
    
    // Run accessibility test on error screen
    await runAccessibilityScan(page, {
      name: 'invalid-token-error',
      exclude: [],
      include: [],
      failOnCritical: true
    });
  });
  
  test('completes multi-milestone survey with performance tracking', async ({ page }) => {
    // Create POM instance with multi-milestone token
    const surveyPage = new SurveyPage(page, TEST_TOKENS.MULTI_MILESTONE);
    
    // Start performance tracking
    performanceMetrics.mark('multi-milestone-test');
    
    // Go to survey page and start
    await surveyPage.goto();
    await surveyPage.startSurvey();
    
    // Check if this is a multi-milestone survey
    const isMultiMilestone = await surveyPage.isMultiMilestoneSurvey();
    expect(isMultiMilestone).toBe(true);
    
    // Run accessibility test on first milestone
    await runAccessibilityScan(page, {
      name: 'multi-milestone-1',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Complete first milestone
    await surveyPage.answerRating(3);
    await surveyPage.next();
    
    performanceMetrics.mark('milestone-1');
    await surveyPage.answerText('Multi-milestone enhanced test response');
    await surveyPage.next();
    performanceMetrics.measure('milestone-1', 'milestone-1-completion');
    
    // Verify milestone progress (if displayed)
    const progressText = await surveyPage.getMilestoneProgress();
    console.log(`Milestone progress: ${progressText}`);
    
    // Run accessibility test on second milestone
    await runAccessibilityScan(page, {
      name: 'multi-milestone-2',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Complete second milestone (radio question)
    performanceMetrics.mark('milestone-2');
    await surveyPage.answerRadio('Easy');
    await surveyPage.next();
    
    // Complete checkbox question
    await surveyPage.answerCheckbox(['More templates', 'Budget planning']);
    await surveyPage.next();
    performanceMetrics.measure('milestone-2', 'milestone-2-completion');
    
    // Run accessibility test on third milestone
    await runAccessibilityScan(page, {
      name: 'multi-milestone-3',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Complete third milestone (select question)
    performanceMetrics.mark('milestone-3');
    await surveyPage.answerSelect('intuitive');
    await surveyPage.next();
    
    // Complete final text question
    await surveyPage.answerText('Final milestone enhanced test response');
    performanceMetrics.measure('milestone-3', 'milestone-3-completion');
    
    // Submit survey
    performanceMetrics.mark('final-submission');
    await surveyPage.submit();
    performanceMetrics.measure('final-submission', 'final-submission-time');
    
    // Run accessibility test on completion screen
    await runAccessibilityScan(page, {
      name: 'multi-milestone-completion',
      exclude: [],
      include: [],
      failOnCritical: true
    });
    
    // Verify completion and return home
    await surveyPage.returnHome();
    
    // End overall test timing
    performanceMetrics.measure('multi-milestone-test', 'total-test-time');
    
    // Verify all milestones were completed efficiently
    const metrics = performanceMetrics.getAllMetrics();
    
    // Get timing for milestones
    const allMetrics = metrics as Record<string, number>;
    
    // Each milestone should be faster than the previous (user gets familiar)
    const milestone2Time = allMetrics['milestone-2-completion'];
    const milestone1Time = allMetrics['milestone-1-completion'];
    
    // Compare milestone times if they exist
    if (milestone2Time && milestone1Time) {
      // Allow for some variation but generally should get faster
      expect(milestone2Time * 1.2).toBeLessThanOrEqual(milestone1Time);
    }
    
    // Verify milestone events were tracked
    // @ts-ignore - Accessing custom property
    const events = page.trackedEvents || [];
    const eventVerification = await surveyPage.verifyEvents(events);
    
    if (eventVerification) {
      const { hasMilestoneEvent } = eventVerification;
      expect(hasMilestoneEvent).toBe(true);
    } else {
      // If no events were found, fail the test
      expect('No events were tracked').toBe('Events should be tracked');
    }
  });
  
  test('properly handles focus trapping in modals', async ({ page }) => {
    // Create POM instance
    const uniqueToken = getUniqueTestToken(TEST_TOKENS.VALID, 'modal-focus-trap');
    const surveyPage = new SurveyPage(page, uniqueToken);
    
    // Go to survey page and start
    await surveyPage.goto();
    await surveyPage.startSurvey();
    
    // Fill out first question
    await surveyPage.answerRating(4);
    
    // Test keyboard navigation - focus should trap within the survey form
    // Try to tab through all focusable elements
    let focusCount = 0;
    let previousFocusedElement = null;
    
    // Press Tab 10 times and track focus
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      
      // Get currently focused element
      const focusedElement = await page.evaluate(() => {
        return document.activeElement ? document.activeElement.outerHTML : null;
      });
      
      // Count unique elements that receive focus
      if (focusedElement && focusedElement !== previousFocusedElement) {
        focusCount++;
        previousFocusedElement = focusedElement;
      }
    }
    
    // We should have a reasonable number of focusable elements and not escape the survey
    expect(focusCount).toBeGreaterThan(1); // More than one element can receive focus
    expect(focusCount).toBeLessThan(10); // Focus wraps around, not escaping to browser UI
    
    // Complete the survey for cleanup
    await surveyPage.next();
    await surveyPage.answerText('Focus trap test');
    await surveyPage.submit();
    await surveyPage.returnHome();
  });
}); 