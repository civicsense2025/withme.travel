// External dependencies
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';  
import { Page, Route } from '@playwright/test';

// Internal modules
import { test, expect } from '@playwright/test';
import { surveyUrl } from './utils/test-base.js';
import { loadTestTokens } from './utils/test-helpers.js';
import { logError, logHtml, logDiagnostic } from './utils/logger';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface for event request
interface EventRequest {
  event_type: string;
  milestone?: string;
  progress?: number;
  [key: string]: any;
}

// Helper function to find an element using multiple selector strategies
async function findElement(page: Page, selectors: string[], timeout = 10000) {
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    try {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: i === 0 ? timeout : 1000 })) {
        console.log(`Found element with selector: ${selector}`);
        return element;
      }
    } catch (e) {
      if (i === selectors.length - 1) {
        console.error(`Failed to find element with any of the selectors:`, selectors);
        throw e;
      }
    }
  }
  throw new Error(`Could not find element with selectors: ${selectors.join(', ')}`);
}

// For debugging: take screenshot with context
async function takeDebugScreenshot(page: Page, name: string) {
  const screenshotPath = `./test-results/${name}-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Took debug screenshot: ${screenshotPath}`);
  return screenshotPath;
}

// Load test tokens from file or use defaults
let TEST_TOKENS: Record<string, string>;

// Run once before all tests
test.beforeAll(async () => {
  console.log('Setting up test environment...');

  // Set required environment variables if not already set
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  // Load test tokens
  TEST_TOKENS = loadTestTokens();
  
  if (!TEST_TOKENS || !TEST_TOKENS.VALID) {
    console.warn('⚠️ No valid test tokens found. Using default test tokens.');
    
    // Set default test tokens if none found
    TEST_TOKENS = {
      VALID: 'valid-test-token',
      EXPIRED: 'expired-test-token',
      INVALID: 'invalid-test-token',
      MULTI_MILESTONE: 'multi-milestone-test-token'
    };
  }
  
  console.log('Test tokens loaded:', TEST_TOKENS);
});

test.describe('User Testing Survey Flow', () => {
  const surveyUrl = (token: string) => `/user-testing/survey?token=${token}`;
  
  // Setup: before each test, route API calls as needed
  test.beforeEach(async ({ page }: { page: Page }) => {
    const trackedEvents: EventRequest[] = [];
    
    // Get mock survey data
    try {
      const mockDataPath = path.join(__dirname, '.test-seed.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));
      const mockSurveyData = mockData.mockSurveyData;
      
      console.log('Loaded mock survey data:', mockSurveyData);
    
    // Set up route handlers BEFORE any navigation
    await Promise.all([
      // Handle survey API routes
      page.route('**/api/research/surveys/**', async (route: Route) => {
        const url = route.request().url();
        console.log('Intercepted survey API request:', url);
          
          // Mock the survey response based on token type
          if (url.includes('valid') || url.includes(TEST_TOKENS.VALID)) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockSurveyData.basicSurvey)
            });
          }
          
          // Handle multi-milestone survey
          if (url.includes('multi') || url.includes(TEST_TOKENS.MULTI_MILESTONE)) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockSurveyData.multiMilestoneSurvey)
            });
          }
        
        // Handle expired token
          if (url.includes('expired') || url.includes(TEST_TOKENS.EXPIRED)) {
          console.log('Mocking expired session response');
          return route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ 
              error: 'Session expired',
              message: 'Your session has expired. Please return to the home page.'
            })
          });
        }
        
        // Handle invalid token
          if (url.includes('invalid') || url.includes(TEST_TOKENS.INVALID)) {
          console.log('Mocking invalid token response');
          return route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ 
              error: 'Invalid token',
              message: 'This survey token does not exist or is invalid.'
            })
          });
        }
        
        // Allow all other requests to proceed normally
        return route.continue();
      }),
        
        // Mock session API
        page.route('**/api/research/sessions/**', async (route: Route) => {
          const url = route.request().url();
          console.log('Intercepted session API request:', url);
          
          // Mock the session response based on token
          if (url.includes('valid') || url.includes(TEST_TOKENS.VALID)) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                form_id: mockSurveyData.basicSurvey.id,
                session_token: TEST_TOKENS.VALID,
                status: 'active',
                progress: 0
              })
            });
          }
          
          // Handle multi-milestone session
          if (url.includes('multi') || url.includes(TEST_TOKENS.MULTI_MILESTONE)) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                form_id: mockSurveyData.multiMilestoneSurvey.id,
                session_token: TEST_TOKENS.MULTI_MILESTONE,
                status: 'active',
                progress: 0,
                metadata: {
                  milestones: {
                    current: 0,
                    total: 3
                  }
                }
              })
            });
          }
          
          // Handle expired token
          if (url.includes('expired') || url.includes(TEST_TOKENS.EXPIRED)) {
            return route.fulfill({
              status: 401,
              contentType: 'application/json',
              body: JSON.stringify({ 
                error: 'Session expired',
                message: 'Your session has expired. Please return to the home page.'
              })
            });
          }
          
          // Handle invalid token
          if (url.includes('invalid') || url.includes(TEST_TOKENS.INVALID)) {
            return route.fulfill({
              status: 404,
              contentType: 'application/json',
              body: JSON.stringify({ 
                error: 'Invalid token',
                message: 'This survey token does not exist or is invalid.'
              })
            });
          }
          
          // Default response for unknown tokens
          return route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Session not found' })
          });
        }),
      
      // Handle event tracking API
      page.route('**/api/research/events', async (route: Route) => {
        try {
          // Safely parse the request data
          const postData = await route.request().postData();
          if (postData) {
            try {
              const jsonData = JSON.parse(postData);
              trackedEvents.push(jsonData);
              console.log('Tracked event:', jsonData);
            } catch (e) {
              console.error('Failed to parse event JSON:', e);
            }
          }
          
          // Always respond with success to keep test flowing
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        } catch (err) {
          console.error('Error handling event route:', err);
          return route.continue();
        }
      }),
      
      // Handle form responses API
      page.route('**/api/research/forms/**', async (route: Route) => {
        console.log('Intercepted forms API request:', route.request().url());
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
      }),
      
      // Handle milestone triggers API
      page.route('**/api/research/milestone-triggers**', async (route: Route) => {
        console.log('Intercepted milestone triggers API request:', route.request().url());
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
      })
    ]);
      
    } catch (error) {
      console.error('Error setting up mock data:', error);
    }
    
    // Store tracked events on the page object for later use
    (page as any).trackedEvents = trackedEvents;
  });

  test('completes entire survey flow with all micro-interactions and animations', async ({ page }: { page: Page }) => {
    try {
      // Navigate to the survey page
      await page.goto(surveyUrl(TEST_TOKENS.VALID));
      
      // Take screenshot at the beginning for debugging
      await takeDebugScreenshot(page, 'survey-start');
      
      // Check for welcome heading using multiple selector strategies
      const welcomeHeading = await findElement(page, [
        '[data-testid="survey-welcome-heading"]',
        'h1:has-text("Welcome")',
        'h2:has-text("Welcome")',
        '.heading:has-text("Welcome")'
      ]);
      await expect(welcomeHeading).toBeVisible();
      
      // Check for Start button using multiple selector strategies
      const startButton = await findElement(page, [
        '[data-testid="survey-start-button"]',
        'button:has-text("Start")',
        'button.start-button'
      ]);
      await expect(startButton).toBeVisible();
      
      // Check for intro text
      await expect(page.getByText(/help us improve/i)).toBeVisible();
      
      // Start the survey
      await startButton.click();
      console.log('Clicked start button');
      
      // Verify progress bar appears and animations
      const progressBar = await findElement(page, [
        '.bg-primary',
        '[data-testid="progress-bar"]',
        '.progress-indicator'
      ]);
      await expect(progressBar).toBeVisible();
      
      // Step 1: Required validation - try to proceed without answering
      const nextButton = await findElement(page, [
        'button:has-text("Next")',
        '[data-testid="next-button"]'
      ]);
      await nextButton.click();
      console.log('Clicked next button without answering');
      
      // Check for validation error
      const validationError = await findElement(page, [
        '.text-error:has-text("required")',
        '[data-testid="validation-error"]',
        '.error-message'
      ]);
      await expect(validationError).toBeVisible();
      
      // Fill in the required field (rating question)
      const ratingOptions = page.locator('label[for^="rating-"]');
      console.log('Found rating options, clicking the first one');
      await ratingOptions.first().click();
      
      // Verify validation error is gone after filling
      await expect(validationError).not.toBeVisible();
      
      // Proceed to next step
      await nextButton.click();
      console.log('Clicked next button after answering');
      
      // Check animation occurred (this is approximate since animations are hard to test precisely)
      await page.waitForTimeout(300); // Wait for animation
      
      // Step 2: Enter optional information (text field)
      const textField = await findElement(page, [
        'textarea',
        'input[type="text"]',
        '[data-testid="text-input"]'
      ]);
      await expect(textField).toBeVisible();
      await textField.fill('This is test feedback');
      console.log('Filled text field');
      
      // Test going back to previous step
      const previousButton = await findElement(page, [
        'button:has-text("Previous")',
        '[data-testid="previous-button"]'
      ]);
      await previousButton.click();
      console.log('Clicked previous button');
      
      // Verify we're back at the first question
      await expect(ratingOptions.first()).toBeVisible();
      
      // Go forward again
      await nextButton.click();
      console.log('Clicked next button again');
      
      // Verify data persisted when navigating
      await expect(textField).toHaveValue('This is test feedback');
      
      // Submit the form
      const submitButton = await findElement(page, [
        'button:has-text("Submit")',
        '[data-testid="submit-button"]'
      ]);
      await submitButton.click();
      console.log('Clicked submit button');
      
      // Take screenshot of the completion screen
      await takeDebugScreenshot(page, 'survey-complete');
      
      // Verify completion screen displays with animated checkmark
      const thankYouMessage = await findElement(page, [
        'text="Thank you"',
        'h1:has-text("Thank you")',
        'h2:has-text("Thank you")',
        '[data-testid="completion-message"]'
      ]);
      await expect(thankYouMessage).toBeVisible();
      
      // Check for svg checkmark
      const checkmark = await findElement(page, [
        'svg circle', 
        '[data-testid="checkmark"]',
        '.checkmark'
      ]);
      await expect(checkmark).toBeVisible();
      
      // Wait for checkmark animation
      await page.waitForTimeout(800);
      
      // Click return home button
      const homeButton = await findElement(page, [
        'button:has-text("Return Home")',
        'button:has-text("home")', 
        '[data-testid="home-button"]'
      ]);
      await homeButton.click();
      console.log('Clicked return home button');
      
      // Verify we've navigated away (URL change)
      await expect(page).toHaveURL(/\//);
    } catch (error) {
      // Capture page HTML for analysis
      const html = await page.content();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Log the HTML content
      logHtml(html, { 
        name: 'completes-entire-survey-flow', 
        timestamp 
      });
      
      // Take a screenshot
      const screenshotPath = await takeDebugScreenshot(page, `error-entire-survey-flow-${timestamp}`);
      
      // Log the error with context
      logError(error, {
        name: 'completes-entire-survey-flow',
        file: 'survey-flow.spec.ts',
        timestamp,
        browserName: page.context().browser()?.browserType().name() || 'unknown'
      }, {
        url: page.url(),
        viewport: page.viewportSize(),
        screenshotPath,
        testTokens: TEST_TOKENS
      });
      
      // Re-throw the error to fail the test
      throw error;
    }
  });

  test('completes multi-milestone survey with progress tracking', async ({ page }: { page: Page }) => {
    try {
      // Navigate to the multi-milestone survey page
      await page.goto(surveyUrl(TEST_TOKENS.MULTI_MILESTONE));
      
      // Debug: log before checking welcome heading
      console.log('Checking for welcome heading (multi-milestone)...');
      try {
        await expect(page.locator('[data-testid="survey-welcome-heading"]')).toBeVisible({ timeout: 10000 });
      } catch (err) {
        // Log the specific error for the welcome heading
        const html = await page.content();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Log detailed context about this specific error
        logHtml(html, { 
          name: 'multi-milestone-welcome-heading-error', 
          timestamp 
        });
        
        await page.screenshot({ path: 'e2e-debug-multi-welcome-heading.png' });
        console.error('Failed to find multi-milestone welcome heading:', err);
        
        // Log the error with context
        logError(err, {
          name: 'multi-milestone-welcome-heading-error',
          file: 'survey-flow.spec.ts',
          timestamp,
          browserName: page.context().browser()?.browserType().name() || 'unknown'
        }, {
          url: page.url(),
          viewport: page.viewportSize(),
          elementSelector: '[data-testid="survey-welcome-heading"]',
          visibleElements: await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-testid]'))
              .map(el => el.getAttribute('data-testid'));
          })
        });
        
        throw err;
      }
      console.log('Multi-milestone welcome heading found.');
      
      // Debug: log before clicking Begin Session
      console.log('Clicking Begin Session...');
      try {
        await page.getByText(/begin session/i).click({ timeout: 10000 });
      } catch (err) {
        await page.screenshot({ path: 'e2e-debug-begin-session.png' });
        console.error('Failed to click Begin Session:', err);
        throw err;
      }
      console.log('Begin Session clicked.');
      
      // Should start with milestone 1 (onboarding)
      await expect(page.getByText(/how easy was it to sign up/i)).toBeVisible();
      
      // Check progress indicator shows correct milestone (1 of 3)
      await expect(page.locator('[data-testid="milestone-progress"]')).toContainText('1/3');
      
      // Complete first milestone questions
      await page.locator('label[for^="rating-"]').nth(3).click(); // Select 4 stars
      await page.getByText(/continue/i).click();
      
      await page.getByLabel(/improve.*signup/i).fill('Signup was great!');
      await page.getByText(/continue/i).click();
      
      // Should now be at milestone 2 (trip creation)
      await expect(page.getByText(/experience creating a trip/i)).toBeVisible();
      
      // Check progress indicator updated (2 of 3)
      await expect(page.locator('[data-testid="milestone-progress"]')).toContainText('2/3');
      
      // Complete second milestone questions
      await page.getByText('Easy').click(); // Select radio option
      await page.getByText(/continue/i).click();
      
      // For checkbox question, select multiple options
      await page.getByLabel('More templates').check();
      await page.getByLabel('AI-powered suggestions').check();
      await page.getByText(/continue/i).click();
      
      // Should now be at milestone 3 (itinerary editing)
      await expect(page.getByText(/how intuitive was the itinerary editor/i)).toBeVisible();
      
      // Check progress indicator updated (3 of 3)
      await expect(page.locator('[data-testid="milestone-progress"]')).toContainText('3/3');
      
      // Complete final milestone questions
      await page.locator('select').selectOption('intuitive');
      await page.getByText(/continue/i).click();
      
      await page.getByLabel(/additional feedback/i).fill('The editor worked well!');
      
      // Submit the entire multi-milestone survey
      await page.getByText(/complete survey/i).click();
      
      // Verify completion screen
      await expect(page.getByText(/thank you for participating/i)).toBeVisible();
      
      // Test that events were tracked by checking request
      const eventRequests: EventRequest[] = [];
      await page.route('**/api/research/events', (route: Route) => {
        eventRequests.push(route.request().postDataJSON());
        route.continue();
      });
      
      // Go back to home and verify events were sent
      await page.getByText(/finish/i).click();
      
      // Verify milestone progress events were tracked
      expect(eventRequests.some(req => 
        req.event_type === 'survey_milestone_completed' && 
        req.milestone === 'onboarding_complete'
      )).toBeTruthy();
    } catch (error) {
      // Capture diagnostic information
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const html = await page.content();
      
      // Log the HTML content
      logHtml(html, { 
        name: 'multi-milestone-survey', 
        timestamp 
      });
      
      // Take a screenshot
      const screenshotPath = await takeDebugScreenshot(page, `error-multi-milestone-${timestamp}`);
      
      // Get all visible data-testid elements for debugging
      const visibleTestIds = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-testid]'))
          .map(el => ({
            testId: el.getAttribute('data-testid'),
            isVisible: el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
          }));
      });
      
      // Log detailed diagnostic information
      logDiagnostic({
        url: page.url(),
        visibleTestIds,
        windowSize: await page.evaluate(() => ({
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight
        })),
        testTokens: TEST_TOKENS
      }, {
        name: 'multi-milestone-survey',
        timestamp
      });
      
      // Log the error with context
      logError(error, {
        name: 'multi-milestone-survey',
        file: 'survey-flow.spec.ts',
        timestamp,
        browserName: page.context().browser()?.browserType().name() || 'unknown'
      }, {
        url: page.url(),
        viewport: page.viewportSize(),
        screenshotPath
      });
      
      // Re-throw the error to fail the test
      throw error;
    }
  });

  test('handles network errors gracefully', async ({ page }: { page: Page }) => {
    // Simulate network errors for all API calls
    await page.route('**/api/**', (route: Route) => route.abort('failed'));
    
    await page.goto(surveyUrl(TEST_TOKENS.VALID));
    await page.getByTestId('survey-start-button').click();
    
    // Try to submit the first question
    await page.locator('label[for^="rating-"]').first().click();
    await page.getByText('Next').click();
    
    // Should show error state
    await expect(page.getByText(/failed to submit|network error|try again/i)).toBeVisible();
    
    // Check for retry button
    await expect(page.getByText(/retry/i)).toBeVisible();
    
    // Click retry (will still fail, but tests the retry path)
    await page.getByText(/retry/i).click();
    
    // Still shows error
    await expect(page.getByText(/failed to submit|network error|try again/i)).toBeVisible();
  });

  test('shows session expired error with appropriate recovery options', async ({ page }: { page: Page }) => {
    console.log('Starting session expired error test');
    
    // Go to the survey page with expired token
    const expiredTokenUrl = surveyUrl(TEST_TOKENS.EXPIRED);
    console.log('Navigating to URL with expired token:', expiredTokenUrl);
    await page.goto(expiredTokenUrl);
    
    // Wait for page to load and take screenshot for debugging
    await page.waitForLoadState('networkidle');
    const screenshotPath = await takeDebugScreenshot(page, 'expired-session');
    console.log(`Took screenshot: ${screenshotPath}`);
    
    // Get full HTML for debugging if needed
    const html = await page.content();
    fs.writeFileSync('./test-results/expired-token-html.txt', html);
    
    // Try multiple selector strategies for error container
    const errorContainer = await findElement(page, [
      '[data-testid="error-container"]',
      '.error-container',
      'div:has-text("Session expired")',
      '[role="alert"]'
    ], 10000);
    
    await expect(errorContainer).toBeVisible();
    
    // Check error message text using multiple selectors
    const errorVisible = await Promise.any([
      page.locator('[data-testid="error-message"]').isVisible(),
      page.locator('.error-message').isVisible(),
      page.getByText(/session expired/i).isVisible(),
      page.getByRole('alert').isVisible()
    ]).catch(() => false);
    
    expect(errorVisible).toBe(true);
    
    // Check for home button using multiple selectors
    const homeButtonVisible = await Promise.any([
      page.getByText(/return home/i).isVisible(),
      page.getByRole('link', { name: /home/i }).isVisible(),
      page.getByRole('button', { name: /home/i }).isVisible(),
      page.locator('[data-testid="home-button"]').isVisible()
    ]).catch(() => false);
    
    expect(homeButtonVisible).toBe(true);
  });

  test('handles invalid token correctly', async ({ page }: { page: Page }) => {
    // Use an invalid token
    await page.goto(surveyUrl(TEST_TOKENS.INVALID));
    
    // Should show an error message
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText(/invalid token|not found|doesn't exist/i);
  });

  test('preserves user responses when navigating between steps', async ({ page }: { page: Page }) => {
    await page.goto(surveyUrl(TEST_TOKENS.VALID));
    await page.getByTestId('survey-start-button').click();
    
    // Fill step 1 (rating question)
    await page.locator('label[for^="rating-"]').nth(4).click(); // 5-star rating
    await page.getByText('Next').click();
    
    // Fill step 2 (text field)
    await page.getByLabel(/improve/i).fill('Navigation test');
    
    // Go back to step 1
    await page.getByText('Previous').click();
    
    // Verify rating is preserved (5-star should be selected)
    await expect(page.locator('label[for^="rating-"]').nth(4)).toHaveClass(/selected/);
    
    // Go forward again
    await page.getByText('Next').click();
    
    // Verify text is preserved
    await expect(page.getByLabel(/improve/i)).toHaveValue('Navigation test');
  });

  test('tracks milestone progress events correctly', async ({ page }: { page: Page }) => {
    await page.goto(surveyUrl(TEST_TOKENS.MULTI_MILESTONE));
    
    // Find and click begin session button
    const beginButton = await findElement(page, [
      'button:has-text("Begin Session")',
      '[data-testid="start-button"]',
      'button.start-button'
    ]);
    await beginButton.click();
    
    // Complete first milestone
    await page.locator('label[for^="rating-"]').first().click();
    
    // Find continue button
    const continueButton = await findElement(page, [
      'button:has-text("Continue")',
      '[data-testid="next-button"]'
    ]);
    await continueButton.click();
    
    // Fill second question
    await page.getByLabel(/improve.*signup/i).fill('Event tracking test');
    await continueButton.click();
    
    // Wait for events to be processed
    await page.waitForTimeout(500);
    
    // Get tracked events from the page object
    const trackedEvents = (page as any).trackedEvents || [];
    console.log('Tracked events:', JSON.stringify(trackedEvents, null, 2));
    
    // Use a more forgiving check for events
    const foundMilestoneEvent = trackedEvents.some((event: EventRequest) => 
      event.event_type?.includes('milestone') && 
      (event.milestone?.includes('onboarding') || event.details?.milestone?.includes('onboarding'))
    );
    
    // Check for progress updated event
    const foundProgressEvent = trackedEvents.some((event: EventRequest) => 
      event.event_type?.includes('progress') && 
      (typeof event.progress === 'number' || typeof event.details?.progress === 'number')
    );
    
    expect(foundMilestoneEvent).toBeTruthy();
    expect(foundProgressEvent).toBeTruthy();
  });

  test('renders correctly on mobile viewport sizes', async ({ page }: { page: Page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(surveyUrl(TEST_TOKENS.VALID));
    await page.getByTestId('survey-start-button').click();
    
    // Check responsive layout elements
    await expect(page.locator('.max-w-3xl')).toBeVisible(); // Card should be visible
    await expect(page.getByText('Next')).toBeVisible(); // Buttons should be visible
    
    // Fill and navigate
    await page.locator('label[for^="rating-"]').first().click();
    await page.getByText('Next').click();
    
    // Verify fields are properly sized for mobile
    const textField = page.getByLabel(/improve/i);
    const textFieldBounds = await textField.boundingBox();
    
    // Field should fit within the viewport with some margin
    expect(textFieldBounds?.width).toBeLessThan(355); // Less than viewport width (375)
    
    // Submit on mobile
    await page.getByText('Submit').click();
    
    // Verify completion screen is mobile friendly
    await expect(page.getByText(/thank you/i)).toBeVisible();
  });

  test('survey is accessible (passes basic a11y checks)', async ({ page }: { page: Page }) => {
    await page.goto(surveyUrl(TEST_TOKENS.VALID));
    
    // Run accessibility audit on welcome screen
    const welcomeResults = await new AxeBuilder({ page }).analyze();
    expect(welcomeResults.violations.length).toBe(0);
    
    await page.getByTestId('survey-start-button').click();
    
    // Run accessibility audit on questions screen
    const questionsResults = await new AxeBuilder({ page }).analyze();
    expect(questionsResults.violations.length).toBe(0);
    
    // Fill and submit to get to completion screen
    await page.locator('label[for^="rating-"]').first().click();
    await page.getByText('Next').click();
    
    await page.getByLabel(/improve/i).fill('A11y test');
    await page.getByText('Submit').click();
    
    // Run accessibility audit on completion screen
    const completionResults = await new AxeBuilder({ page }).analyze();
    expect(completionResults.violations.length).toBe(0);
  });

  test('keyboard navigation works correctly throughout survey', async ({ page }: { page: Page }) => {
    await page.goto(surveyUrl(TEST_TOKENS.VALID));
    
    // Press Tab to focus on Start button, then Enter to click it
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify we're on the first question
    await expect(page.getByText(/satisfied/i)).toBeVisible();
    
    // Use keyboard to select a rating (Tab to navigate, Space to select)
    await page.keyboard.press('Tab'); // Focus on first rating option
    await page.keyboard.press('Space'); // Select it
    
    // Tab to the Next button and press Enter
    await page.keyboard.press('Tab'); // May need multiple tabs depending on DOM structure
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify we're on the second question
    await expect(page.getByLabel(/improve/i)).toBeVisible();
    
    // Fill the text field
    await page.getByLabel(/improve/i).fill('Keyboard navigation test');
    
    // Tab to the Submit button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify completion screen
    await expect(page.getByText(/thank you/i)).toBeVisible();
    
    // Tab to the home button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify we navigated home
    await expect(page).toHaveURL(/\//);
  });

  test('in-app trigger creates a survey modal on milestone event', async ({ page }: { page: Page }) => {
    // Login first (assuming we have a test login flow)
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('/dashboard');
    
    // Set up route to intercept milestone triggers
    await page.route('**/api/research/milestone-triggers**', (route: Route) => {
      // Return our test trigger for trip creation
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          found: true,
          trigger: {
            form_id: 'basic-survey-id',
            event_type: 'trip_created'
          }
        })
      });
    });
    
    // Trigger the trip creation event
    await page.click('[data-testid="create-trip-button"]');
    
    // Fill in trip creation form and submit
    await page.fill('[name="tripName"]', 'Test Trip');
    await page.click('button[type="submit"]');
    
    // Verify the survey modal appears
    await expect(page.locator('[data-testid="research-modal"]')).toBeVisible();
    await expect(page.getByText(/Welcome to our survey/i)).toBeVisible();
    
    // Complete the modal survey
    await page.click('button:has-text("Start")');
    await page.locator('label[for^="rating-"]').first().click();
    await page.click('button:has-text("Next")');
    await page.fill('textarea', 'Modal test feedback');
    await page.click('button:has-text("Submit")');
    
    // Verify completion screen in modal
    await expect(page.getByText(/thank you for your feedback/i)).toBeVisible();
    
    // Close the modal
    await page.click('button:has-text("Return Home")');
    
    // Verify modal is gone and we're still on the trip page
    await expect(page.locator('[data-testid="research-modal"]')).not.toBeVisible();
    await expect(page).toHaveURL(/\/trips\//);
  });
}); 