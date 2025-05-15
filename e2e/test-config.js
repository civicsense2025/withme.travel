/**
 * E2E Test Configuration
 * 
 * Configuration and helper utilities for E2E tests
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Get base URL for tests - fallback to local host if not set
 */
export const TEST_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

/**
 * Get survey URL with token parameter
 */
export const surveyUrl = (token) => `/user-testing/survey?token=${token}`;

/**
 * Generate a unique test token based on a base token and test name
 */
export function getUniqueTestToken(baseToken, testName) {
  if (!baseToken) {
    throw new Error('Base token is required');
  }
  
  // Generate UUID to ensure uniqueness
  const uniqueId = uuidv4().slice(0, 8);
  
  // Combine base token with test name (if provided) and unique ID
  const uniqueToken = testName 
    ? `${baseToken}-${testName}-${uniqueId}`
    : `${baseToken}-${uniqueId}`;
  
  return uniqueToken;
}

/**
 * Default test configuration
 */
export const DEFAULT_TEST_CONFIG = {
  timeout: 30000, // Default timeout for tests (30 seconds)
  retries: 1,     // Number of test retries
  viewport: {
    width: 1280,   // Default viewport width
    height: 800    // Default viewport height
  },
  mobile: {
    width: 375,    // Mobile viewport width (iPhone)
    height: 667    // Mobile viewport height
  },
  tablet: {
    width: 768,    // Tablet viewport width (iPad)
    height: 1024   // Tablet viewport height
  },
  // Feature flags for tests
  features: {
    screenshots: true,    // Enable screenshots
    videoCapture: false,  // Disable video capture by default (can be resource intensive)
    accessibility: true,  // Enable accessibility testing
    performance: true     // Enable performance metrics
  }
}; 