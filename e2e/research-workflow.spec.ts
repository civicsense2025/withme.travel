/**
 * Research System Workflow Tests
 * 
 * A comprehensive test suite that validates the forms-based research system
 * across multiple dimensions: functionality, accessibility, and performance.
 */
import { test, expect } from '@playwright/test';
import { ResearchPage } from './models/ResearchPage';
import { 
  testKeyboardNavigation, 
  testFocusTrap,
  generateAccessibilityReport 
} from './utils/accessibility-helpers';
import { 
  startPerformanceTracking,
  endPerformanceTracking, 
  reportPerformanceMetrics,
  startInteraction,
  endInteraction
} from './utils/performance-helpers';

// Test constants - update these based on your environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_FORM_ID = process.env.TEST_FORM_ID || 'test-form-123';

// Test suite for the research system
test.describe('Research System Workflows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Log test environment information
    console.log('======= Test Environment =======');
    console.log(`- Base URL: ${BASE_URL}`);
    console.log(`- Test Form ID: ${TEST_FORM_ID}`);
    console.log('===============================');
  });
  
  // === Basic Survey Flow Tests ===
  
  test('completes basic survey flow successfully', async ({ page }) => {
    // Create research page object
    const researchPage = new ResearchPage(page, { 
      baseUrl: BASE_URL,
      formId: TEST_FORM_ID,
      debug: true
    });
    
    // Start performance tracking
    await startPerformanceTracking(page, 'basic-survey-flow');
    
    // Navigate to the survey
    await researchPage.gotoSurvey();
    
    // Complete the entire survey with default answers
    await researchPage.completeEntireSurvey();
    
    // Verify completion
    const isComplete = await researchPage.isCompletionScreenVisible();
    expect(isComplete).toBeTruthy();
    
    // End performance tracking and report metrics
    const metrics = await endPerformanceTracking(page);
    await reportPerformanceMetrics(metrics, 'basic-survey-flow');
  });
  
  // === Accessibility Tests ===
  
  test('survey meets accessibility standards', async ({ page }) => {
    // Create research page object
    const researchPage = new ResearchPage(page, { 
      baseUrl: BASE_URL,
      formId: TEST_FORM_ID
    });
    
    // Navigate to the survey
    await researchPage.gotoSurvey();
    
    // Test welcome screen accessibility
    const welcomeScreenViolations = await researchPage.checkAccessibility();
    expect(welcomeScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
    
    // Start the survey
    await researchPage.startSurvey();
    
    // Test question screen accessibility
    const questionScreenViolations = await researchPage.checkAccessibility();
    expect(questionScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
    
    // Test keyboard navigation
    const keyboardNavigable = await testKeyboardNavigation(page);
    expect(keyboardNavigable).toBeTruthy();
    
    // Generate comprehensive report
    const accessibilityReport = await generateAccessibilityReport(page, {
      pageTitle: 'Survey Question Screen',
      keyElements: [
        '[data-testid="survey-container"]',
        '[data-testid="survey-form"]',
        '[data-testid="form-field"]'
      ]
    });
    
    console.log(`Accessibility Report Summary: ${accessibilityReport.criticalIssuesCount} critical issues`);
  });
  
  // === Focus Management Tests ===
  
  test('survey properly manages focus through navigation', async ({ page }) => {
    // Create research page object
    const researchPage = new ResearchPage(page, { 
      baseUrl: BASE_URL,
      formId: TEST_FORM_ID
    });
    
    // Navigate to the survey
    await researchPage.gotoSurvey();
    
    // Start the survey
    await researchPage.startSurvey();
    
    // Answer current question and go to next
    await researchPage.answerCurrentQuestion('Test answer');
    await researchPage.goToNextQuestion();
    
    // Ensure focus is not on body
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
    
    // Go back to previous question
    await researchPage.goToPreviousQuestion();
    
    // Check focus again
    const secondFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocusedElement).not.toBe('BODY');
  });
  
  // === Error Handling Tests ===
  
  test('handles invalid form ID gracefully', async ({ page }) => {
    // Create research page with invalid form ID
    const researchPage = new ResearchPage(page, { 
      baseUrl: BASE_URL,
      formId: 'non-existent-form-id',
      debug: true
    });
    
    // Try to navigate to non-existent form
    await researchPage.gotoSurvey();
    
    // Check for error message
    const isErrorVisible = await page.locator('[data-testid="error-container"]').isVisible();
    expect(isErrorVisible).toBeTruthy();
  });
  
  // === Performance Tests ===
  
  test('survey loads and responds within performance thresholds', async ({ page }) => {
    // Create research page object
    const researchPage = new ResearchPage(page, { 
      baseUrl: BASE_URL,
      formId: TEST_FORM_ID
    });
    
    // Start performance tracking
    await startPerformanceTracking(page, 'survey-performance');
    
    // Measure initial page load
    const startTime = Date.now();
    await researchPage.gotoSurvey();
    const loadTime = Date.now() - startTime;
    
    // Verify load time is reasonable (5 seconds max)
    expect(loadTime).toBeLessThan(5000);
    
    // Measure survey start interaction
    await startInteraction(page, 'survey-start');
    await researchPage.startSurvey();
    const startDuration = await endInteraction(page, 'survey-start');
    
    // Verify survey start time is reasonable (2 seconds max)
    expect(startDuration).toBeLessThan(2000);
    
    // Measure question interaction time
    await startInteraction(page, 'answer-question');
    await researchPage.answerCurrentQuestion('Performance test answer');
    const answerDuration = await endInteraction(page, 'answer-question');
    
    // Verify question answer time is reasonable (1 second max)
    expect(answerDuration).toBeLessThan(1000);
    
    // Measure navigation interaction time
    await startInteraction(page, 'next-question');
    await researchPage.goToNextQuestion();
    const navigationDuration = await endInteraction(page, 'next-question');
    
    // Verify navigation time is reasonable (1 second max)
    expect(navigationDuration).toBeLessThan(1000);
    
    // End performance tracking and report metrics
    const metrics = await endPerformanceTracking(page);
    await reportPerformanceMetrics(metrics, 'survey-performance', {
      loadTime: 3000,
      fcp: 1000,
      lcp: 2500
    });
  });
  
  // === Combined End-to-End Flow ===
  
  test('completes full research flow with all testing dimensions', async ({ page }) => {
    // Create research page object
    const researchPage = new ResearchPage(page, { 
      baseUrl: BASE_URL,
      formId: TEST_FORM_ID,
      debug: true
    });
    
    // Start performance tracking
    await startPerformanceTracking(page, 'full-e2e-flow');
    
    // Navigate to the survey
    await researchPage.gotoSurvey();
    
    // Check accessibility on welcome screen
    const welcomeScreenViolations = await researchPage.checkAccessibility({
      excludedSelectors: ['iframe', '[role="dialog"]'] // Exclude any non-essential elements
    });
    expect(welcomeScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
    
    // Test keyboard navigation
    const keyboardNavigable = await testKeyboardNavigation(page);
    expect(keyboardNavigable).toBeTruthy();
    
    // Start the survey
    await researchPage.startSurvey();
    
    // Check accessibility on first question
    const questionScreenViolations = await researchPage.checkAccessibility();
    expect(questionScreenViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
    
    // Complete the entire survey with various answers
    await researchPage.completeEntireSurvey([
      'First question answer',
      1, // Select second option for questions with choices
      'Detailed feedback for text question',
      0 // Select first option for questions with choices
    ]);
    
    // Verify completion
    const isComplete = await researchPage.isCompletionScreenVisible();
    expect(isComplete).toBeTruthy();
    
    // End performance tracking and report metrics
    const metrics = await endPerformanceTracking(page);
    await reportPerformanceMetrics(metrics, 'full-e2e-flow');
    
    // Generate final accessibility report
    await generateAccessibilityReport(page, {
      pageTitle: 'Survey Completion Screen',
      includeScreenshot: true
    });
  });
  
  // === Milestone-Based Survey Tests ===
  
  test('handles multi-milestone surveys correctly', async ({ page }) => {
    // Create research page object with milestone parameter
    const researchPage = new ResearchPage(page, { 
      baseUrl: BASE_URL,
      formId: TEST_FORM_ID
    });
    
    // Navigate to the survey with specific milestone
    await researchPage.gotoSurvey(undefined, {
      milestone: 'onboarding_complete'
    });
    
    // Complete the survey for this milestone
    await researchPage.completeEntireSurvey();
    
    // Verify completion
    const isComplete = await researchPage.isCompletionScreenVisible();
    expect(isComplete).toBeTruthy();
    
    // Navigate to a different milestone of the same survey
    await researchPage.gotoSurvey(undefined, {
      milestone: 'trip_from_template'
    });
    
    // Verify we get a different survey experience
    await researchPage.startSurvey();
    
    // The questions should be different for this milestone
    // We can verify by completing this survey as well
    await researchPage.completeEntireSurvey([
      'Different milestone answer',
      'This is a separate survey flow for a different milestone'
    ]);
    
    // Verify completion
    const isSecondComplete = await researchPage.isCompletionScreenVisible();
    expect(isSecondComplete).toBeTruthy();
  });
}); 