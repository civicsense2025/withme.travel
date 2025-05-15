# User Research Survey Testing Guide

This document explains how to run, maintain, and extend the user research survey end-to-end tests for withme.travel.

## Overview

Our survey testing system provides comprehensive testing for:

- Basic survey completion flow
- Multi-milestone surveys
- Accessibility compliance
- Keyboard navigation and focus management
- Performance metrics
- Error cases (invalid tokens, expired sessions)

## Prerequisites

Before running the tests, make sure you have:

1. Node.js installed (v16 or higher)
2. Playwright installed (`npm install -D @playwright/test`)
3. Supabase running locally for database access
4. Environment variables set correctly (see below)

## Running the Tests

### Method 1: Using the Script (Recommended)

The simplest way to run the survey tests is to use the provided script:

```bash
# Basic usage
./e2e/run-research-tests.sh

# Run with browser visible
./e2e/run-research-tests.sh --headed

# Run in debug mode (more logs and screenshots)
./e2e/run-research-tests.sh --debug

# Run a specific test file
./e2e/run-research-tests.sh --test=enhanced-survey-flow.spec.ts
```

The script automatically sets the required environment variables and runs the tests.

### Method 2: Manual Setup

If you need more control, you can set the environment variables manually and run the tests:

```bash
# Set required environment variables
export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
export SURVEY_BASE_URL=http://localhost:3000
export DEBUG_SURVEY_TESTS=true  # Optional - enables debug mode

# Run tests directly with Playwright
npx playwright test e2e/consolidated-survey-flow.spec.ts
```

## Environment Variables

These environment variables are required for the tests to run properly:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL of your Supabase instance | `http://localhost:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...` |
| `SURVEY_BASE_URL` | Base URL of your application | `http://localhost:3000` |
| `DEBUG_SURVEY_TESTS` | Whether to enable debug mode | `true` or `false` |

## Test Files

We've consolidated our testing approach into these key files:

- **`consolidated-survey-flow.spec.ts`**: The main test file that covers all survey testing aspects
- **`models/SurveyPage.ts`**: Page Object Model for survey interactions
- **`utils/test-helpers.ts`**: Common utilities for testing
- **`utils/accessibility-helpers.ts`**: Accessibility testing utilities
- **`utils/performance-helpers.ts`**: Performance tracking utilities
- **`test-environment.ts`**: Environment configuration and utilities

## Test Results

Test results are saved to the `test-results/` directory:

- `test-results/performance/`: Performance metrics in JSON format
- Screenshots and HTML snapshots from test runs
- Accessibility violations reports

## Page Object Model

The `SurveyPage` class provides a clean API for interacting with surveys:

```typescript
// Create a page model instance
const surveyPage = new SurveyPage(page, { 
  token: 'test-token',
  debug: true 
});

// Navigate and complete survey
await surveyPage.goto();
await surveyPage.startSurvey();
await surveyPage.answerQuestion(0); // Answer first question
await surveyPage.goToNextQuestion();
await surveyPage.answerQuestion(1); // Answer second question
await surveyPage.submitSurvey();

// Check results
const isComplete = await surveyPage.isCompletionScreenVisible();
const confirmationCode = await surveyPage.getConfirmationCode();
```

## Accessibility Testing

Each test run includes accessibility checks at key points:

1. Welcome screen
2. Question screens
3. Completion screen

The tests use Axe for accessibility scanning and report violations.

## Performance Tracking

Performance metrics are collected during test runs:

- Page load times
- Interaction response times
- Navigation timing
- Custom metrics

These metrics are saved to JSON files in the `test-results/performance/` directory.

## Common Issues and Solutions

### Test Failures

If tests are failing, check these common issues:

1. **Environment variables**: Make sure all required environment variables are set correctly.
2. **Supabase connection**: Ensure Supabase is running and accessible.
3. **Survey tokens**: The tests need valid survey tokens. Check if they are being generated correctly.
4. **UI changes**: If the UI has changed, the selectors in the `SurveyPage` class may need to be updated.

### Missing Test Tokens

If test tokens are missing, you can generate them manually or use the script.

### Debugging Tests

To debug tests:

1. Run with the `--debug` flag: `./e2e/run-research-tests.sh --debug`
2. Run in headed mode to see the browser: `./e2e/run-research-tests.sh --headed`
3. Check the test logs and screenshots in the `test-results/` directory
4. Add more logging in the test files for specific issues

## Extending the Tests

### Adding a New Test Case

To add a new test case:

1. Open `consolidated-survey-flow.spec.ts`
2. Add your test following the existing pattern:

```typescript
test('your new test case', async ({ page }) => {
  // Get a unique token for this test
  const token = getUniqueTestToken(TEST_TOKENS.VALID, 'your-test');
  
  // Create survey page object
  const surveyPage = new SurveyPage(page, { token });
  
  // Implement your test logic
  await surveyPage.goto();
  // ...
});
```

### Adding New Page Object Methods

To add new functionality to the `SurveyPage` class:

1. Open `models/SurveyPage.ts`
2. Add your new method following the existing pattern:

```typescript
/**
 * Your new method description
 */
async yourNewMethod(): Promise<void> {
  // Implementation
}
```

## Maintenance

### Keeping Selectors Up to Date

The most common maintenance task is updating selectors when the UI changes. These are defined in the `locators` object in `SurveyPage.ts`:

```typescript
private locators = {
  welcomeHeading: 'h1:has-text("Welcome"), h2:has-text("Welcome")',
  // Other selectors...
};
```

Update these selectors as needed when the UI changes. 