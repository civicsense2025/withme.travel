/**
 * Test Helper Utilities
 * 
 * Custom assertions and helper functions to make tests more robust and maintainable.
 */
import { Page, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { config } from '../test-config';

/**
 * Event Request interface for typechecking tracked events
 */
export interface EventRequest {
  event_type: string;
  milestone?: string;
  progress?: number;
  [key: string]: any;
}

/**
 * Find an element using multiple selector strategies
 * Tries each selector in order until one is found or all fail
 */
export async function findElement(page: Page, selectors: string[], timeout = config.timeouts.defaultElement) {
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

/**
 * Take a screenshot for debugging purposes
 * Returns the path of the screenshot for logging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  // Create test-results directory if it doesn't exist
  const dirPath = './test-results';
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const screenshotPath = `${dirPath}/${name}-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Took debug screenshot: ${screenshotPath}`);
  return screenshotPath;
}

/**
 * Capture page HTML for debugging purposes
 */
export async function capturePageHtml(page: Page, name: string) {
  const dirPath = './test-results';
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const htmlPath = `${dirPath}/${name}-${Date.now()}.html`;
  const html = await page.content();
  fs.writeFileSync(htmlPath, html);
  console.log(`Captured HTML to: ${htmlPath}`);
  return htmlPath;
}

/**
 * Assert that a specific event was tracked
 * More expressive and provides better error messages than manual checks
 */
export async function expectEventTracked(
  events: EventRequest[], 
  options: {
    eventType: string,
    milestone?: string,
    contains?: Record<string, any>
  }
) {
  const { eventType, milestone, contains = {} } = options;
  
  const foundEvent = events.find(event => {
    if (event.event_type !== eventType) return false;
    if (milestone && event.milestone !== milestone) return false;
    
    // Check all properties in contains
    for (const [key, value] of Object.entries(contains)) {
      if (JSON.stringify(event[key]) !== JSON.stringify(value)) return false;
    }
    
    return true;
  });
  
  expect(foundEvent, `Expected to find event type "${eventType}"${milestone ? ` with milestone "${milestone}"` : ''}`).toBeTruthy();
  return foundEvent;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>, 
  options: { 
    retries?: number,
    delay?: number,
    backoff?: number,
    onRetry?: (attempt: number, error: unknown) => void
  } = {}
): Promise<T> {
  const { 
    retries = config.retries.apiCallRetries,
    delay = 1000,
    backoff = 2,
    onRetry = (attempt, error) => console.log(`Retry ${attempt}: ${error}`)
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt <= retries) {
        onRetry(attempt, error);
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

/**
 * Check if an element exists (without throwing)
 */
export async function elementExists(page: Page, selectors: string[]): Promise<boolean> {
  try {
    await findElement(page, selectors, 5000);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Load test tokens from file with fallback values
 */
export function loadTestTokens() {
  try {
    const tokensPath = path.join(process.cwd(), '.test-seed.json');
    const fileData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    console.log('Loaded test tokens from file:', fileData.TEST_TOKENS);
    return fileData.TEST_TOKENS;
  } catch (err) {
    console.error('Failed to load test tokens:', err);
    // Fallback to hardcoded tokens if file doesn't exist
    return {
      VALID: 'test-survey-token',
      EXPIRED: 'expired-survey-token',
      INVALID: 'invalid-survey-token',
      MULTI_MILESTONE: 'multi-milestone-token',
    };
  }
} 