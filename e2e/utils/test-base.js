import { test as base, expect, Page, Route } from '@playwright/test';
import { readTestTokens } from './test-helpers';

/**
 * Extend the base test with fixtures that handle token loading and error recovery
 */
export const test = base.extend({
  // Add a fixture for tokens that will be available to all tests
  testTokens: async ({}, use) => {
    // Load tokens outside the test context
    const tokens = await readTestTokens();
    console.log('Loaded test tokens for fixtures:', Object.keys(tokens).join(', '));
    await use(tokens);
  },
  
  // Override the page fixture to add retry logic and better error handling
  page: async ({ page, context }, use) => {
    // Store the original goto function
    const originalGoto = page.goto.bind(page);
    
    // Override goto with retry logic
    page.goto = async (url, options = {}) => {
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Navigation attempt ${attempt}/${maxRetries} to ${url}`);
          
          // Force a timeout to ensure we don't hang
          const timeoutOptions = {
            timeout: 15000,
            waitUntil: 'domcontentloaded',
            ...options
          };
          
          const response = await originalGoto(url, timeoutOptions);
          console.log(`Successfully navigated to ${url}`);
          return response;
        } catch (error) {
          console.error(`Navigation attempt ${attempt} failed:`, error.message);
          lastError = error;
          
          // Take a screenshot for debugging
          try {
            await page.screenshot({ 
              path: `./test-results/navigation-error-${Date.now()}.png`,
              fullPage: true 
            });
          } catch (e) {
            console.log('Could not take error screenshot:', e.message);
          }
          
          // Check if we should retry
          if (attempt < maxRetries) {
            console.log(`Waiting before retry ${attempt + 1}...`);
            await new Promise(r => setTimeout(r, 1000 * attempt));
            
            // Create a new context if needed
            if (error.message.includes('detached') || 
                error.message.includes('closed') ||
                error.message.includes('crashed')) {
              console.log('Browser may have crashed, checking state...');
              
              // Check if the context is still viable
              try {
                const pages = context.pages();
                console.log(`Context has ${pages.length} pages`);
                if (pages.length === 0) {
                  throw new Error('Context has no pages');
                }
              } catch (e) {
                // Context itself might be gone, we'll let the test fail
                console.error('Context appears to be invalid:', e.message);
                throw lastError;
              }
            }
          }
        }
      }
      
      // If we get here, all retries failed
      throw lastError;
    };
    
    // Add a helper method for robust element finding
    page.findElement = async (selectors, timeout = 5000) => {
      for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        try {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: i === 0 ? timeout : 1000 })) {
            return element;
          }
        } catch (e) {
          if (i === selectors.length - 1) {
            throw new Error(`Could not find element with selectors: ${selectors.join(', ')}`);
          }
        }
      }
      throw new Error(`Could not find element with selectors: ${selectors.join(', ')}`);
    };
    
    // Add helper for debug screenshots
    page.takeDebugScreenshot = async (name) => {
      try {
        const screenshotPath = `./test-results/${name}-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Took debug screenshot: ${screenshotPath}`);
        return screenshotPath;
      } catch (e) {
        console.error('Failed to take debug screenshot:', e);
        return null;
      }
    };
    
    await use(page);
  }
});

export { expect };

/**
 * Helper to construct the survey URL
 */
export function surveyUrl(token) {
  return `/user-testing/survey?token=${token}`;
}