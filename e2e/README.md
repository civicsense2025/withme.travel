# withme.travel Research System Testing

This directory contains E2E tests for the withme.travel research system, focused on validating form-based surveys and user feedback collection.

## Overview

These tests validate the research system across multiple dimensions:
- **Functional testing**: Basic form completion flows
- **Accessibility testing**: WCAG compliance, keyboard navigation, focus management
- **Performance testing**: Load times, interaction times, form submission
- **Error handling**: Proper messaging, form validation, network issues

## Setup

### Prerequisites

- Node.js 18+
- npm/pnpm
- Access to a development instance of withme.travel

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```
BASE_URL=http://localhost:3000
TEST_FORM_ID=your-test-form-id
SEED_TEST_DATA=true
CLEANUP_TEST_DATA=true
```

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in a specific browser
npm run test:e2e -- --project=chromium

# Run a specific test file
npm run test:e2e -- research-workflow.spec.ts

# Run in debug mode with UI
npm run test:e2e -- --debug
```

## Test Architecture

### Page Object Model

We use the Page Object Model (POM) pattern to encapsulate UI interactions. The main class is `ResearchPage` which provides methods for interacting with the research system.

```typescript
const researchPage = new ResearchPage(page, { 
  baseUrl: BASE_URL,
  formId: TEST_FORM_ID
});

await researchPage.gotoSurvey();
await researchPage.startSurvey();
await researchPage.answerCurrentQuestion('My answer');
await researchPage.goToNextQuestion();
```

### Utilities

The test suite includes several utility modules:

- **accessibility-helpers.ts**: Tools for accessibility testing
- **performance-helpers.ts**: Performance tracking and metrics
- **research-data-helpers.ts**: Test data management

### Test Data Management

Instead of relying on tokens, tests interact directly with forms via their IDs. You can create test data programmatically:

```typescript
const dataHelper = new ResearchDataHelper(page);
const formId = await dataHelper.createStandardTestForm();

// Use the form ID in tests
await researchPage.gotoSurvey(formId);
```

## Accessibility Testing

We've integrated axe-core for accessibility testing:

```typescript
const violations = await researchPage.checkAccessibility();
expect(violations.filter(v => v.impact === 'critical')).toHaveLength(0);
```

## Performance Testing

Performance metrics are tracked automatically:

```typescript
await startPerformanceTracking(page, 'form-submission');
// Perform actions
const metrics = await endPerformanceTracking(page);
```

## Best Practices

1. **Test isolation**: Each test should clean up its own data
2. **Defensive waiting**: Use explicit waits for elements rather than timeouts
3. **Meaningful assertions**: Assert specific conditions, not general success
4. **Realistic user flows**: Test complete user journeys, not just isolated components
5. **Cross-browser compatibility**: Test on multiple browsers and viewports

## Troubleshooting

### Common Issues

- **Test timeouts**: Ensure your element selectors are correct and elements are visible
- **Authentication issues**: Test forms may require specific session states
- **Database conflicts**: Use unique test data to avoid conflicts

### Debug Mode

Enable debug logs with:

```typescript
const researchPage = new ResearchPage(page, { 
  debug: true
});
```

This will save screenshots at key points during test execution.

## Contributing

When adding new tests:

1. Use the existing Page Object Model
2. Follow the structure of existing tests
3. Add meaningful comments and assertions
4. Test across multiple browsers and viewports
5. Include accessibility checks 