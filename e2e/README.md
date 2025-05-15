# E2E Testing Architecture for WithMe.Travel

This directory contains end-to-end tests using Playwright. The testing architecture follows best practices for reliability, maintainability, and debuggability.

## Key Components

### 1. Test Configuration (`test-config.ts`)

Central configuration for:
- Timeouts and retry settings
- Common selector strategies
- Helper functions for test isolation

### 2. Test Helpers (`utils/test-helpers.ts`)

Utilities to make tests more robust:
- `findElement()`: Multi-strategy selector finder
- `retry()`: Exponential backoff retry mechanism
- `expectEventTracked()`: Custom assertions
- `takeDebugScreenshot()`: Visual debugging

### 3. Page Object Models (`models/`)

Page objects encapsulate interactions with specific pages:
- `SurveyPage`: Handles all survey interactions
- Future: `TripPage`, `ItineraryPage`, etc.

### 4. Test Data Seeding (`utils/research-seed.ts`)

Robust test data management:
- Transaction support
- Parameterized seeding
- Thorough cleanup with retries
- Proper error handling

### 5. Global Setup/Teardown

Proper test isolation:
- `global-setup.ts`: Seeds test data before all tests
- `global-teardown.ts`: Cleans up after tests

## Best Practices

1. **Use Page Object Models**: Encapsulate page interactions for better maintainability
   ```ts
   const surveyPage = new SurveyPage(page, token);
   await surveyPage.goto();
   await surveyPage.startSurvey();
   ```

2. **Prefer findElement over direct selectors**: Handles DOM changes gracefully
   ```ts
   // Bad
   await page.getByTestId('error-message').click();
   
   // Good
   const errorMessage = await findElement(page, config.selectors.errorMessage);
   await errorMessage.click();
   ```

3. **Test Isolation**: Use unique tokens for each test
   ```ts
   const uniqueToken = getUniqueTestToken(TEST_TOKENS.VALID, 'test-name');
   ```

4. **Debug Artifacts**: Always capture screenshots and HTML for failures
   ```ts
   await takeDebugScreenshot(page, 'error-state');
   await capturePageHtml(page, 'error-details');
   ```

5. **Route Interception**: Handle all API calls consistently
   ```ts
   await page.route('**/api/research/surveys/**', handleSurveyRoutes);
   ```

6. **Retry Logic**: Use exponential backoff for flaky operations
   ```ts
   await retry(async () => {
     // Potentially flaky operation
   }, { retries: 3, delay: 1000 });
   ```

7. **Proper Error Handling**: Don't hide errors, log and handle them
   ```ts
   try {
     // Operation that might fail
   } catch (error) {
     console.error(`Failed with error: ${error}`);
     await takeDebugScreenshot(page, 'failure');
     throw error;
   }
   ```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test survey-flow.spec.ts

# Run with UI mode for debugging
npx playwright test --ui

# Run with debug mode
DEBUG=pw:api npx playwright test
```

## Adding New Tests

1. Consider if a Page Object is needed (if reusable across tests)
2. Use the test-config.ts selectors where possible
3. Handle all API routes consistently
4. Add proper assertions and debug artifacts
5. Use unique test data for isolation
6. Add cleanup for any created test data

## Troubleshooting

Test failures are captured in:
- Screenshots: `./test-results/[name]-[timestamp].png`
- HTML dumps: `./test-results/[name]-[timestamp].html`
- Playwright traces (if enabled): `./test-results/trace.zip`

Check the test logs for:
- "Failed to find element" messages
- API request/response issues
- Token/test data problems

## CI Integration

Tests run in CI with:
- Parallelization disabled to prevent race conditions
- Explicit environment variables
- Strict timeout handling
- Fail-fast mode for early error detection

```bash
# Generate and view HTML report
npx playwright show-report
``` 