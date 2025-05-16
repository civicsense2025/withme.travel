/**
 * Playwright Configuration for Research Testing
 * 
 * This file configures the Playwright test runner for our research system tests,
 * including browsers, reporting, and screenshots.
 */
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './',
  
  // Only run files that match this pattern
  testMatch: '**/research-workflow.spec.ts',
  
  // Maximum time one test can run (30 seconds)
  timeout: 30000,
  
  // Run tests in files in parallel
  fullyParallel: false, // Keep sequential for now as we're testing the same form
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Number of workers (parallel test runners)
  workers: process.env.CI ? 2 : 1,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['list', { printSteps: true }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Enable network request logging
    contextOptions: {
      logger: {
        isEnabled: () => true,
        log: (name, severity, message) => console.log(`${name} [${severity}]: ${message}`)
      }
    }
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    // Low-vision/accessibility
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        // Enable accessibility features
        viewport: { width: 1280, height: 720 },
        // Enhanced logging for accessibility issues
        contextOptions: {
          logger: {
            isEnabled: () => true,
            log: (name, severity, message) => {
              if (name === 'accessibility') {
                console.log(`[Accessibility] ${message}`);
              }
            }
          }
        }
      },
    }
  ],
  
  // Configure output directory for screenshots and videos
  outputDir: 'test-results/',
  
  // Control webpack dev server when testing locally
  webServer: process.env.SKIP_SERVER ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  
  // Global setup to create test environment
  globalSetup: path.join(__dirname, 'setup/global-setup.ts'),
  
  // Global teardown to clean test environment
  globalTeardown: path.join(__dirname, 'setup/global-teardown.ts')
}); 