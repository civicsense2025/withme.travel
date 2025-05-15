/**
 * Test Helpers
 * 
 * Shared utilities for e2e tests that provide consistent approaches for:
 * - Element finding and interaction
 * - Error handling and debugging
 * - Timing and performance
 * - Token management
 */
import { Page, Locator, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { TestEnvironment } from '../test-environment';

/**
 * Wait for a specified amount of time
 * 
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the wait
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load test tokens from environment or file
 * 
 * @returns Object with different token types
 */
export async function loadTestTokens(): Promise<Record<string, string>> {
  // First check environment
  const envToken = process.env.TEST_SURVEY_TOKEN;
  
  if (envToken) {
    return {
      VALID: envToken,
      EXPIRED: process.env.TEST_SURVEY_TOKEN_EXPIRED || envToken,
      INVALID: 'invalid-token-12345'
    };
  }
  
  // Then try to load from file
  try {
    const tokensPath = path.join(__dirname, '../test-tokens.json');
    if (fs.existsSync(tokensPath)) {
      const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
      return tokens;
    }
  } catch (error) {
    console.warn('Failed to load test tokens from file:', error);
  }
  
  // Fallback to default tokens
  return {
    VALID: TestEnvironment.getDefaultSurveyToken(),
    EXPIRED: 'expired-token-12345',
    INVALID: 'invalid-token-12345'
  };
}

/**
 * Find an element with flexible selector strategies and error handling
 * 
 * @param page Playwright page object
 * @param selector Selector string or object with multiple strategies
 * @param timeout Optional timeout in ms
 * @returns Locator for the element
 */
export async function findElement(
  page: Page, 
  selector: string | { css?: string; text?: string; testId?: string; },
  timeout = 5000
): Promise<Locator> {
  // Convert string selector to object
  const selectorObj = typeof selector === 'string' 
    ? { css: selector } 
    : selector;
  
  // Try different selector strategies in order
  let element: Locator | null = null;
  
  // First try test-id if specified (most reliable)
  if (selectorObj.testId) {
    try {
      element = page.getByTestId(selectorObj.testId);
      const isVisible = await element.isVisible({ timeout: Math.min(timeout, 1000) });
      if (isVisible) return element;
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  // Then try text content
  if (selectorObj.text) {
    try {
      element = page.getByText(selectorObj.text, { exact: false });
      const isVisible = await element.isVisible({ timeout: Math.min(timeout, 1000) });
      if (isVisible) return element;
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  // Finally try CSS selector
  if (selectorObj.css) {
    element = page.locator(selectorObj.css);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }
  
  throw new Error(`Failed to find element with selector: ${JSON.stringify(selector)}`);
}

/**
 * Check if an element exists on the page
 * 
 * @param page Playwright page object
 * @param selector Selector for the element
 * @param timeout Optional timeout in ms
 * @returns True if element exists
 */
export async function elementExists(
  page: Page, 
  selector: string | { css?: string; text?: string; testId?: string; },
  timeout = 1000
): Promise<boolean> {
  try {
    await findElement(page, selector, timeout);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Take a debug screenshot with timestamped filename
 * 
 * @param page Playwright page object
 * @param name Screenshot name
 */
export async function takeDebugScreenshot(
  page: Page, 
  name: string
): Promise<void> {
  const timestamp = Date.now();
  const filename = `${name}-${timestamp}.png`;
  const directory = './test-results';
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  await page.screenshot({ 
    path: path.join(directory, filename),
    fullPage: true 
  });
  
  console.log(`Screenshot saved: ${filename}`);
}

/**
 * Capture HTML content of the page for debugging
 * 
 * @param page Playwright page object
 * @param name Snapshot name
 */
export async function capturePageHtml(
  page: Page, 
  name: string
): Promise<void> {
  const timestamp = Date.now();
  const filename = `${name}-${timestamp}.html`;
  const directory = './test-logs';
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  const html = await page.content();
  fs.writeFileSync(path.join(directory, filename), html);
  
  console.log(`HTML content saved: ${filename}`);
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn Function to retry
 * @param options Retry options
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>, 
  options: { 
    retries?: number; 
    delay?: number; 
    maxDelay?: number;
    onRetry?: (attempt: number, error?: unknown) => void;
  } = {}
): Promise<T> {
  const maxRetries = options.retries ?? 3;
  const initialDelay = options.delay ?? 500;
  const maxDelay = options.maxDelay ?? 10000;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      // If this was the last attempt, throw the error
      if (attempt > maxRetries) {
        throw err;
      }
      
      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt, err);
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        initialDelay * Math.pow(2, attempt - 1),
        maxDelay
      );
      
      // Wait before next attempt
      await wait(delayMs);
    }
  }
  
  // This should never happen, but TypeScript needs it
  throw lastError;
}

/**
 * Log an error and its details to a file
 * 
 * @param name Error name/context 
 * @param error Error object
 * @param extraInfo Additional information
 */
export function logError(
  name: string,
  error: Error | unknown,
  extraInfo: Record<string, any> = {}
): void {
  const timestamp = Date.now();
  const filename = `error-${name}-${timestamp}.json`;
  const directory = './test-logs';
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  // Create error object with details
  const errorData = {
    name,
    timestamp,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...extraInfo
  };
  
  fs.writeFileSync(
    path.join(directory, filename),
    JSON.stringify(errorData, null, 2)
  );
  
  console.error(`Error logged to: ${filename}`);
} 