# withme.travel E2E Tests

End-to-end tests for the withme.travel platform using Playwright.

## Overview

This directory contains various test suites:

- **User Research Survey Tests**: Tests for the user research survey flows - [See detailed documentation](./SURVEY_TESTING.md)
- General site functionality tests
- Performance tests

## Running Tests

### Survey Tests (Recommended)

For survey testing, use the dedicated runner script:

```bash
./run-research-tests.sh
```

This automatically sets up the environment and runs the consolidated survey tests. See [SURVEY_TESTING.md](./SURVEY_TESTING.md) for detailed documentation.

### General E2E Tests

For other tests, use the standard Playwright commands:

```bash
# Run all tests
npx playwright test

# Run a specific test file
npx playwright test example.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed
```

## Project Structure

```
e2e/
├── consolidated-survey-flow.spec.ts  # Main survey test file (current approach)
├── models/                           # Page Object Models
│   └── SurveyPage.ts                 # POM for survey tests
├── utils/                            # Utility functions
│   ├── accessibility-helpers.ts      # Accessibility testing utilities
│   ├── performance-helpers.ts        # Performance measurement utilities
│   ├── research-seed.ts              # Seed and cleanup utilities
│   └── test-helpers.ts               # General helpers
├── test-environment.ts               # Environment configuration
├── run-research-tests.sh             # Runner script for survey tests
├── SURVEY_TESTING.md                 # Detailed survey test documentation
└── README.md                         # This file
```

## Test Development Guidelines

When adding new tests:

1. Use the Page Object Model pattern to encapsulate UI interactions
2. Add test utilities to the appropriate files in `/utils`
3. Follow the existing patterns for test organization
4. Run tests in CI mode before committing: `CI=true npx playwright test`
5. Add appropriate documentation

## Debugging Tests

For failing tests, check the following artifacts:

- Screenshots: `test-results/*.png`
- HTML snapshots: `test-logs/*.html`
- Error logs: `test-logs/error-*.json`
- Playwright traces: `test-results/trace/`

Use trace viewer to analyze test runs:

```bash
npx playwright show-trace test-results/trace/trace.zip
```

## Environment Setup

Most tests require a local Supabase instance running:

```bash
# Start Supabase
npx supabase start

# Run tests with required environment variables
export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

npx playwright test
``` 