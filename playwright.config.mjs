/**
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
import { defineConfig } from '@playwright/test';

const config = {
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: 'html',

  /* Configure projects for different browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        // Launch options
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,

        // Enable video for debugging
        video: 'retain-on-failure',

        // Enable screenshot on failure
        screenshot: 'only-on-failure',

        // Context options
        storageState: {},

        // Artifacts
        trace: 'retain-on-failure',
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        browserName: 'chromium',
        headless: true,
        viewport: { width: 414, height: 896 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },
  ],

  /* Configure the local development server to run before the tests */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000, // 2 minutes
      },

  /* Set the base URL for the tests */
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  outputDir: 'test-results/',
};

export default config;
