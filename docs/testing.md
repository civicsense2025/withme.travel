# withme.travel Testing Guidelines

This document provides comprehensive guidelines for testing in the withme.travel project. It covers testing philosophy, approaches, tools, and best practices to ensure consistent and effective testing across the codebase.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Test Directory Structure](#test-directory-structure)
4. [Tools and Libraries](#tools-and-libraries)
5. [Mocking Strategies](#mocking-strategies)
6. [Writing Effective Tests](#writing-effective-tests)
7. [Component Testing Patterns](#component-testing-patterns)
8. [API Testing Patterns](#api-testing-patterns)
9. [Test Fixtures and Data](#test-fixtures-and-data)
10. [Continuous Integration](#continuous-integration)
11. [Example: `EventUrlInput` Component Test](#example-eventurlinput-component-test)

## Testing Philosophy

Our testing approach follows these key principles:

- **Test behaviors, not implementation details**: Focus on testing what components do, not how they're built internally.
- **User-centric testing**: Write tests that simulate how users interact with the application.
- **Balanced test coverage**: Prioritize critical paths and complex functionality.
- **Maintainable tests**: Tests should be easy to understand and maintain.
- **Fast and reliable**: Tests should run quickly and produce consistent results.

## Test Types

We use several types of tests to ensure comprehensive coverage:

### Unit Tests

- Test individual functions, hooks, or small components in isolation
- Focus on logical correctness and edge cases
- Use mocks for dependencies
- Location: `__tests__/[component/util name].test.tsx`

### Component Tests

- Test individual React components
- Focus on rendering, user interactions, and component lifecycle
- Mock API calls and providers
- Location: `__tests__/components/[ComponentName].component.tsx`

### Integration Tests

- Test interactions between multiple components or systems
- Focus on data flow and component communication
- Minimize mocking where possible
- Location: `__tests__/integration/[feature].test.tsx`

### End-to-End Tests

- Test complete user flows through the application
- Use real browser environment
- Location: `tests/e2e/[feature].spec.js`

## Test Directory Structure

```
withme.travel/
├── __tests__/                  # Jest tests
│   ├── components/             # Component tests
│   ├── hooks/                  # Custom hook tests
│   ├── utils/                  # Utility function tests
│   └── integration/            # Integration tests
├── tests/                      # E2E tests
│   └── e2e/                    # Playwright tests
├── mocks/                      # Mock implementations
│   ├── handlers.js             # MSW request handlers
│   ├── server.js               # MSW server setup
│   └── browser.js              # MSW browser setup
└── utils/
    └── testing/                # Test utilities
        └── test-utils.ts       # Common test utilities
```

## Tools and Libraries

We use the following tools for testing:

### Core Testing Libraries

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: End-to-end testing

### Additional Libraries

- **user-event**: Simulating user interactions
- **@testing-library/jest-dom**: Custom DOM matchers

## Mocking Strategies

### API Mocking

We use MSW (Mock Service Worker) to intercept and mock API requests. For simple cases or when MSW compatibility issues arise, we can also use Jest's `fetch` mocking capabilities.

#### Using MSW

```jsx
// In test file
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

// Add custom handler for this test
beforeAll(() => {
  server.use(
    http.post('/api/endpoint', () => {
      return HttpResponse.json({ data: 'mocked-data' });
    })
  );
});

// MSW will intercept all fetch requests to '/api/endpoint'
```

#### Using Jest Fetch Mocking

```jsx
// Mock fetch globally
global.fetch = jest.fn();

// Configure mock implementation
global.fetch.mockImplementation((url) => {
  if (url === '/api/endpoint') {
    return Promise.resolve(
      new Response(JSON.stringify({ data: 'mocked-data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
  return Promise.reject(new Error('Not found'));
});
```

### Context Provider Mocking

For components that depend on React context:

```jsx
// Mock auth context
jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isLoading: false,
  }),
}));
```

### Component Mocking

Mock child components when testing parent components:

```jsx
// Mock a component
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));
```

## Writing Effective Tests

### Test Structure

Each test file should follow this structure:

```jsx
// 1. Imports
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentToTest } from '@/components/path';

// 2. Mocks setup
jest.mock('...'); // Mock dependencies

// 3. Test data setup
const mockData = {...};

// 4. Test suite
describe('ComponentName', () => {
  // 5. Setup and teardown
  beforeEach(() => {
    // Common setup
  });

  afterEach(() => {
    // Common cleanup
  });

  // 6. Individual tests
  it('should render correctly', () => {
    // Arrange
    render(<ComponentToTest />);

    // Act
    // (user interaction if needed)

    // Assert
    expect(...).toBeInTheDocument();
  });
});
```

### Naming Conventions

- Test files: `[ComponentName].test.tsx` or `[ComponentName].component.tsx`
- Test suites: `describe('ComponentName', () => {...})`
- Test cases: `it('should do something when condition', () => {...})`

### Testing Best Practices

1. **Use accessible queries**: Prefer queries that reflect how users interact with the UI

   ```jsx
   // Good
   screen.getByRole('button', { name: /submit/i });

   // Avoid
   screen.getByTestId('submit-button');
   ```

2. **Test user interactions**: Use `userEvent` to simulate user behavior

   ```jsx
   const user = userEvent.setup();
   await user.click(screen.getByRole('button'));
   ```

3. **Test async behavior**: Use `waitFor` or `findBy` queries for async operations

   ```jsx
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

4. **Isolate tests**: Each test should be independent and not rely on state from other tests

5. **Mock minimum required**: Only mock what's necessary to isolate the component under test

## Component Testing Patterns

### Rendering Tests

Test if a component renders correctly:

```jsx
it('renders correctly', () => {
  render(<Component prop1="value" />);
  expect(screen.getByText('Expected Content')).toBeInTheDocument();
});
```

### User Interaction Tests

Test how components respond to user interactions:

```jsx
it('updates when user types in input', async () => {
  const user = userEvent.setup();
  render(<InputComponent />);

  const input = screen.getByLabelText('Email');
  await user.type(input, 'test@example.com');

  expect(input).toHaveValue('test@example.com');
});
```

### State Change Tests

Test component state changes:

```jsx
it('shows loading state when submitting', async () => {
  const user = userEvent.setup();
  render(<FormComponent />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
});
```

### Error Handling Tests

Test how components handle errors:

```jsx
it('displays error message when API call fails', async () => {
  // Mock API failure
  global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));

  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## API Testing Patterns

### Success Responses

```jsx
it('fetches and displays data successfully', async () => {
  // Mock successful API response
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve(
      new Response(JSON.stringify({ data: 'test-data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  );

  render(<DataFetchingComponent />);

  // Wait for the data to be displayed
  expect(await screen.findByText('test-data')).toBeInTheDocument();
});
```

### Error Responses

```jsx
it('handles API errors gracefully', async () => {
  // Mock error response
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve(
      new Response(JSON.stringify({ error: 'Something went wrong' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  );

  render(<DataFetchingComponent />);

  // Wait for the error message to be displayed
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});
```

### Loading States

```jsx
it('shows loading state while fetching data', async () => {
  // Create a delayed response
  const createDelayedResponse = (data) => {
    return () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(JSON.stringify(data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }, 100);
      });
  };

  // Mock delayed API response
  global.fetch.mockImplementationOnce(createDelayedResponse({ data: 'test-data' }));

  render(<DataFetchingComponent />);

  // Check for loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to be displayed after loading
  expect(await screen.findByText('test-data')).toBeInTheDocument();

  // Loading state should be gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

## Test Fixtures and Data

### Creating Test Data

Use factories to create test data:

```jsx
// utils/testing/factories.ts
export const createUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const createTrip = (overrides = {}) => ({
  id: 'test-trip-id',
  title: 'Test Trip',
  destination: 'Test Destination',
  ...overrides,
});
```

Then use in tests:

```jsx
import { createUser, createTrip } from '@/utils/testing/factories';

it('renders user trip', () => {
  const user = createUser();
  const trip = createTrip({ createdBy: user.id });

  render(<TripComponent trip={trip} user={user} />);
  // ...
});
```

## Continuous Integration

Our tests run in CI on every pull request and merge to main. The CI process:

1. Runs lint checks
2. Runs unit and component tests
3. Runs integration tests
4. Runs E2E tests (on scheduled builds)

## Example: `EventUrlInput` Component Test

The `EventUrlInput` component test demonstrates many of the testing patterns and practices described in this document.

### Test Overview

The test suite for `EventUrlInput` covers:

1. Initial rendering
2. Input validation
3. Loading states
4. Successful API responses
5. Error handling
6. User interactions

### Key Testing Patterns Demonstrated

#### API Mocking

```jsx
// Mock fetch globally
global.fetch = jest.fn();

// Default implementation
global.fetch.mockImplementation((url) => {
  const urlString = url.toString();

  if (urlString === `/api/trips/${mockTripId}/itinerary/scrape-url`) {
    return Promise.resolve(
      new Response(JSON.stringify(mockScrapedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
  // ...more conditions
});
```

#### Component Mocking

```jsx
// Mock the toast component
const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));
```

#### User Interaction Testing

```jsx
it('successfully adds event to itinerary', async () => {
  const user = userEvent.setup();

  // Type a valid URL and get event data
  const input = screen.getByPlaceholderText(/paste event url/i);
  await user.type(input, 'https://eventbrite.com/e/test-event');
  await user.click(screen.getByRole('button', { name: /get event/i }));

  // Wait for data, then add to itinerary
  await screen.findByText(mockScrapedData.title);
  await user.click(screen.getByRole('button', { name: /add to itinerary/i }));

  // Verify outcome
  await waitFor(() => {
    expect(mockOnEventAdded).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalled();
  });
});
```

#### Loading State Testing

```jsx
it('shows loading state when fetching event data', async () => {
  // Use a delayed response
  global.fetch.mockImplementationOnce(() => createDelayedResponse(mockScrapedData, 50)());

  // Trigger the action that causes loading
  await user.click(button);

  // Verify loading state appears
  const loadingButton = await screen.findByRole('button', { name: /loading/i });
  expect(loadingButton).toBeInTheDocument();
});
```

#### Error Handling Testing

```jsx
it('handles API error when scraping URL', async () => {
  // Mock a server error
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve(
      new Response(JSON.stringify({ error: 'Failed to scrape URL' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  );

  // Trigger the action
  await user.click(button);

  // Verify error state
  const errorAlert = await screen.findByRole('alert');
  expect(errorAlert).toBeInTheDocument();
});
```

### Complete Example

For the complete test example, see [`__tests__/components/EventUrlInput.component.tsx`](../__tests__/components/EventUrlInput.component.tsx).

The example demonstrates:

1. Setting up mocks and test data
2. Testing initial rendering
3. Testing form validation
4. Testing loading states
5. Testing successful API interactions
6. Testing error handling
7. Testing user interactions
8. Testing component cleanup/reset

## Conclusion

Following these testing guidelines will help ensure that our tests are consistent, maintainable, and effective at catching issues before they reach production. By focusing on user behaviors and critical functionality, we can maximize the value of our test suite while keeping it maintainable and efficient.

For additional guidance on testing, refer to:

1. [React Testing Library documentation](https://testing-library.com/docs/react-testing-library/intro/)
2. [Jest documentation](https://jestjs.io/docs/getting-started)
3. [MSW documentation](https://mswjs.io/docs/)
4. [Playwright documentation](https://playwright.dev/docs/intro)
