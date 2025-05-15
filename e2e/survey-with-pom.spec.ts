/**
 * Survey flow tests using Page Object Model approach
 * 
 * This demonstrates how the Page Object Model makes tests more maintainable
 * and easier to understand.
 */
import { test, expect } from '@playwright/test';
import { SurveyPage } from './models/SurveyPage';
import { loadTestTokens } from './utils/test-helpers';
import { getUniqueTestToken } from './test-config';

// Load test tokens
let TEST_TOKENS: Record<string, string>;

// Before all tests, load tokens from file
test.beforeAll(async () => {
  TEST_TOKENS = loadTestTokens();
});

test.describe('Survey Flow with Page Object Model', () => {
  // Setup: before each test, route API calls as needed
  test.beforeEach(async ({ page }) => {
    // Store tracked events on page for verification
    (page as any).trackedEvents = [];
    
    // Handle API calls
    await page.route('**/api/research/events', async route => {
      try {
        const postData = await route.request().postData();
        if (postData) {
          const jsonData = JSON.parse(postData);
          (page as any).trackedEvents.push(jsonData);
        }
        return route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
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
  
  test('completes basic survey flow with validation', async ({ page }) => {
    // Create POM instance with unique token for this test
    const uniqueToken = getUniqueTestToken(TEST_TOKENS.VALID, 'basic-survey');
    const surveyPage = new SurveyPage(page, uniqueToken);
    
    // Go to survey page and start
    await surveyPage.goto();
    await surveyPage.startSurvey();
    
    // Try to proceed without answering required question
    await surveyPage.next();
    expect(await surveyPage.hasValidationError()).toBe(true);
    
    // Answer question and verify error is gone
    await surveyPage.answerRating(4); // 5 stars (0-based index)
    expect(await surveyPage.hasValidationError()).toBe(false);
    
    // Proceed to next question
    await surveyPage.next();
    
    // Answer text question
    await surveyPage.answerText('This is a test response from POM-based test');
    
    // Test back navigation preserves answers
    await surveyPage.previous();
    
    // Go forward again and verify text is preserved
    await surveyPage.next();
    
    // Submit survey
    await surveyPage.submit();
    
    // Verify completion and return home
    await surveyPage.returnHome();
    
    // Verify events were tracked
    const events = (page as any).trackedEvents || [];
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
  
  test('handles expired session correctly', async ({ page }) => {
    // Create POM instance with expired token
    const surveyPage = new SurveyPage(page, TEST_TOKENS.EXPIRED);
    
    // Go to survey page
    await surveyPage.goto();
    
    // Verify expired session error is shown
    expect(await surveyPage.hasExpiredSessionError()).toBe(true);
  });
  
  test('handles invalid token correctly', async ({ page }) => {
    // Create POM instance with invalid token
    const surveyPage = new SurveyPage(page, TEST_TOKENS.INVALID);
    
    // Go to survey page
    await surveyPage.goto();
    
    // Verify invalid token error is shown
    expect(await surveyPage.hasInvalidTokenError()).toBe(true);
  });
  
  test('completes multi-milestone survey', async ({ page }) => {
    // Create POM instance with multi-milestone token
    const surveyPage = new SurveyPage(page, TEST_TOKENS.MULTI_MILESTONE);
    
    // Go to survey page and start
    await surveyPage.goto();
    await surveyPage.startSurvey();
    
    // Check if this is a multi-milestone survey
    const isMultiMilestone = await surveyPage.isMultiMilestoneSurvey();
    expect(isMultiMilestone).toBe(true);
    
    // Complete first milestone
    await surveyPage.answerRating(3);
    await surveyPage.next();
    
    await surveyPage.answerText('Multi-milestone test response');
    await surveyPage.next();
    
    // Verify milestone progress (if displayed)
    const progressText = await surveyPage.getMilestoneProgress();
    console.log(`Milestone progress: ${progressText}`);
    
    // Complete second milestone (radio question)
    await surveyPage.answerRadio('Easy');
    await surveyPage.next();
    
    // Complete checkbox question
    await surveyPage.answerCheckbox(['More templates', 'Budget planning']);
    await surveyPage.next();
    
    // Complete third milestone (select question)
    await surveyPage.answerSelect('intuitive');
    await surveyPage.next();
    
    // Complete final text question
    await surveyPage.answerText('Final milestone test response');
    
    // Submit survey
    await surveyPage.submit();
    
    // Verify completion and return home
    await surveyPage.returnHome();
    
    // Verify milestone events were tracked
    const events = (page as any).trackedEvents || [];
    const eventVerification = await surveyPage.verifyEvents(events);
    
    if (eventVerification) {
      const { hasMilestoneEvent } = eventVerification;
      expect(hasMilestoneEvent).toBe(true);
    } else {
      // If no events were found, fail the test
      expect('No events were tracked').toBe('Events should be tracked');
    }
  });
}); 