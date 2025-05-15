/**
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
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
  ],

  /* Configure the local development server to run before the tests */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120000, // Allow time for Next.js to build
      },

  /* Set the base URL for the tests */
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  },

  // Ensure test data is seeded before all tests and cleaned up after all tests
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
};

export default config;
