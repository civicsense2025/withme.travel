/**
 * E2E Test Configuration
 * 
 * Central configuration for test constants, timeouts, and selector maps
 * to improve maintainability and consistency across tests.
 */

export const config = {
  // Timeouts for various operations
  timeouts: {
    defaultElement: 10000,  // Default timeout for finding elements
    navigation: 30000,      // Timeout for page navigation
    animation: 500,         // Wait time for animations to complete
    apiRequest: 15000       // Timeout for API requests
  },
  
  // Retry configuration
  retries: {
    findElementRetries: 3,  // Number of retries when finding elements
    apiCallRetries: 2,      // Number of retries for API calls
    cleanupRetries: 3       // Number of retries for data cleanup
  },
  
  // Common selector strategies mapped by element purpose
  selectors: {
    // Welcome screen elements
    welcomeHeading: [
      '[data-testid="survey-welcome-heading"]',
      'h1:has-text("Welcome")',
      'h2:has-text("Welcome")',
      '.heading:has-text("Welcome")'
    ],
    startButton: [
      '[data-testid="survey-start-button"]',
      'button:has-text("Start")',
      'button:has-text("Begin")',
      'button.start-button'
    ],
    
    // Navigation buttons
    nextButton: [
      'button:has-text("Next")',
      'button:has-text("Continue")',
      '[data-testid="next-button"]'
    ],
    previousButton: [
      'button:has-text("Previous")',
      'button:has-text("Back")',
      '[data-testid="previous-button"]'
    ],
    submitButton: [
      'button:has-text("Submit")',
      'button:has-text("Complete")',
      '[data-testid="submit-button"]'
    ],
    homeButton: [
      'button:has-text("Return Home")',
      'button:has-text("home")',
      '[data-testid="home-button"]'
    ],
    
    // Form elements
    textInput: [
      'textarea',
      'input[type="text"]',
      '[data-testid="text-input"]'
    ],
    ratingOptions: [
      'label[for^="rating-"]',
      '[data-testid="rating-option"]',
      '.rating-star'
    ],
    
    // Status elements
    progressBar: [
      '.bg-primary',
      '[data-testid="progress-bar"]',
      '.progress-indicator'
    ],
    validationError: [
      '.text-error:has-text("required")',
      '[data-testid="validation-error"]',
      '.error-message'
    ],
    
    // Completion elements
    thankYouMessage: [
      'text="Thank you"',
      'h1:has-text("Thank you")',
      'h2:has-text("Thank you")',
      '[data-testid="completion-message"]'
    ],
    checkmark: [
      'svg circle',
      '[data-testid="checkmark"]',
      '.checkmark'
    ],
    
    // Error elements
    errorContainer: [
      '[data-testid="error-container"]',
      '.error-container',
      'div:has-text("error")',
      '[role="alert"]'
    ],
    errorMessage: [
      '[data-testid="error-message"]',
      '.error-message',
      '.text-error'
    ]
  }
};

/**
 * Generate a unique test token specific to a test case
 * Helps with test isolation and debugging specific test failures
 */
export function getUniqueTestToken(baseToken: string, testName: string): string {
  const sanitizedTestName = testName.replace(/\s+/g, '-').toLowerCase();
  return `${baseToken}-${sanitizedTestName}-${Date.now()}`;
}

/**
 * Get debug information for error reporting
 */
export function getDebugInfo(page: any): Record<string, any> {
  return {
    url: page.url(),
    viewport: page.viewportSize(),
    timestamp: new Date().toISOString()
  };
} 