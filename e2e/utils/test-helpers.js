/**
 * E2E Test Helpers (JavaScript version)
 * 
 * Utility functions to help with e2e test setup, fixtures, and assertions.
 */

import fs from 'fs';
import path from 'path';
import { expect } from '@playwright/test';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Wait for a specified amount of time
 * 
 * @param {number} ms Milliseconds to wait
 * @returns {Promise<void>} Promise that resolves after the wait
 */
export async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load test tokens from environment or file
 * 
 * @returns {Object} Object with different token types
 */
export async function loadTestTokens() {
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
    const tokensPath = path.join(process.cwd(), 'e2e/test-tokens.json');
    if (fs.existsSync(tokensPath)) {
      console.log('Loading test tokens from file:', tokensPath);
      const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
      return tokens;
    }
  } catch (error) {
    console.warn('Failed to load test tokens from file:', error);
  }
  
  // Fallback to default tokens
  console.log('Using fallback test tokens');
  return {
    VALID: 'valid-token-12345',
    EXPIRED: 'expired-token-12345',
    INVALID: 'invalid-token-12345'
  };
}

/**
 * Check if an element exists on the page
 */
export async function elementExists(page, selectors) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  
  for (const selector of selectorArray) {
    try {
      const element = await page.$(selector);
      if (element) {
        return true;
      }
    } catch (err) {
      // Continue to next selector
    }
  }
  
  return false;
}

/**
 * Find element using multiple possible selectors
 */
export async function findElement(page, selectors, timeout) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  return findElementWithFallbacks(page, selectorArray, { timeout });
}

/**
 * Find element with fallbacks
 */
export async function findElementWithFallbacks(
  page, 
  selectors, 
  options = {}
) {
  const timeout = options.timeout || 5000;
  const startTime = Date.now();
  
  for (const selector of selectors) {
    try {
      // Check if we're out of time
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timeout finding element with selectors: ${selectors.join(', ')}`);
      }
      
      // Try to find element with current selector
      const element = options.visible 
        ? await page.waitForSelector(selector, { 
            state: 'visible', 
            timeout: Math.max(1, timeout - (Date.now() - startTime)) 
          })
        : await page.$(selector);
      
      if (element) {
        return element;
      }
    } catch (err) {
      // Continue to next selector
    }
  }
  
  throw new Error(`No element found matching any of: ${selectors.join(', ')}`);
}

/**
 * Take a debug screenshot with timestamped filename
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Screenshot name
 */
export async function takeDebugScreenshot(
  page, 
  name
) {
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
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Snapshot name
 */
export async function capturePageHtml(
  page, 
  name
) {
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
 * Log an error and its details to a file
 * 
 * @param {string} name - Error name/context 
 * @param {Error|any} error - Error object
 * @param {Object} [extraInfo={}] - Additional information
 */
export function logError(
  name,
  error,
  extraInfo = {}
) {
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

/**
 * Retry a function with configurable attempts and delay
 */
export async function retry(fn, options = {}) {
  const { retries = 3, delay = 500, onRetry } = options;
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (onRetry) onRetry(attempt, error);
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}

// Export the functions from research-seed.js
export let cleanupResearchTestDataAfterTests;
export let seedResearchTestData;

// Initialize with dummy implementations that will be replaced
cleanupResearchTestDataAfterTests = async (options = {}) => {
  console.warn('Using dummy cleanupResearchTestDataAfterTests function until real one is loaded');
  return true;
};

seedResearchTestData = async (options = {}) => {
  console.warn('Using dummy seedResearchTestData function until real one is loaded');
  const uniqueSuffix = `test-${Date.now()}`;
  return {
    VALID: `valid-${uniqueSuffix}`,
    EXPIRED: `expired-${uniqueSuffix}`,
    INVALID: `invalid-${uniqueSuffix}`,
    MULTI_MILESTONE: `multi-${uniqueSuffix}`,
  };
};

// Immediately load the real functions
(async () => {
  try {
    // Import the research-seed.js module
    const researchSeed = await import('./research-seed.js');
    // Replace the dummy implementations with the real ones
    cleanupResearchTestDataAfterTests = researchSeed.cleanupResearchTestDataAfterTests;
    seedResearchTestData = researchSeed.seedResearchTestData;
    console.log('Successfully loaded research-seed.js functions');
  } catch (e) {
    console.error('Error loading research seed functions:', e);
  }
})(); 