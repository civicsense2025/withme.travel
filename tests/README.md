# Testing Guide for WithMe.Travel

This guide explains how to use the testing infrastructure set up for the WithMe.Travel project.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Testing Utilities](#testing-utilities)
- [Mocking](#mocking)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)

## Overview

The WithMe.Travel testing infrastructure uses:

- **Jest**: Testing framework and test runner
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API requests
- **Custom Testing Utilities**: For simplifying common testing tasks

## Test Structure

Tests are organized as follows:

```
withme.travel/
├── __tests__/              # Jest test files
│   ├── components/         # Component tests
│   ├── hooks/              # Hook tests
│   ├── pages/              # Page component tests
│   └── utils/              # Utility function tests
├── __mocks__/              # Jest manual mocks
├── mocks/                  # MSW mocks
│   ├── handlers.js         # API request handlers
│   ├── server.js           # Node.js server setup
│   └── browser.js          # Browser setup
└── utils/
    └── testing/            # Testing utilities
        ├── test-utils.tsx  # Custom render function & utilities
        ├── mock-supabase.ts # Supabase mocking helpers
        └── test-data.ts    # Test data generators
```

## Running Tests

The project includes several test scripts in `package.json`:

```bash
# Run all tests
pnpm test

# Run tests in watch mode (re-run when files change)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run specific test types
pnpm test:unit
pnpm test:integration
pnpm test:components

# Run tests in CI environment
pnpm test:ci

# Clear Jest cache
pnpm test:clear-cache
```

## Testing Utilities

### Custom Render Function

Import the custom render function from testing utilities:

```tsx
import { render, screen } from '@/utils/testing/test-utils';

// Use it like React Testing Library's render, but with provider support
render(<YourComponent />, { withNextTheme: true });
```

### Test Data Generators

Generate consistent test data:

```tsx
import {
  generateTestUser,
  generateTestTrip,
  generateTestItineraryItems,
} from '@/utils/testing/test-data';

// Generate a test user
const user = generateTestUser({ name: 'Custom Name' });

// Generate a test trip
const trip = generateTestTrip({ destination: 'Tokyo' });

// Generate multiple itinerary items for a trip
const items = generateTestItineraryItems(trip.id, 5);
```

### Supabase Mocking

Mock Supabase responses:

```tsx
import {
  mockSupabaseSuccess,
  mockSupabaseError,
  setupSupabaseMocks,
} from '@/utils/testing/mock-supabase';

// Mock a successful response
const successResponse = mockSupabaseSuccess({ id: 1, name: 'Test' });

// Mock an error response
const errorResponse = mockSupabaseError('Not found', '404');

// In your test file:
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(mockSupabaseSuccess(testData)),
  })),
}));
```

## Mocking

### MSW for API Mocking

MSW is set up for both Node.js and browser environments. Add custom handlers in `mocks/handlers.js`:

```tsx
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

// In your test
beforeEach(() => {
  // Reset handlers before each test
  server.resetHandlers(
    // Add custom handlers for this test
    http.get('/api/trips/:tripId', ({ params }) => {
      return HttpResponse.json({
        id: params.tripId,
        title: 'Test Trip',
      });
    })
  );
});
```

### Manual Mocks

For imports like images, CSS, etc., Jest uses the mocks in `__mocks__` directory.

## Writing Tests

### Component Tests

Example component test:

```tsx
import { render, screen, waitFor } from '@/utils/testing/test-utils';
import { UserProfile } from '@/components/user/UserProfile';
import { generateTestUser } from '@/utils/testing/test-data';

describe('UserProfile', () => {
  it('renders user information', () => {
    const user = generateTestUser({ name: 'Jane Doe' });

    render(<UserProfile user={user} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});
```

### Hook Tests

Example hook test:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('increments the count', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### Integration Tests

For integration tests, use MSW to mock API responses:

```tsx
import { render, screen, waitFor } from '@/utils/testing/test-utils';
import { TripsPage } from '@/components/trips/TripsPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { generateTestTrips } from '@/utils/testing/test-data';

describe('TripsPage', () => {
  const trips = generateTestTrips(3);

  beforeEach(() => {
    server.use(
      http.get('/api/trips', () => {
        return HttpResponse.json(trips);
      })
    );
  });

  it('displays trips after loading', async () => {
    render(<TripsPage />);

    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for trips to load
    await waitFor(() => {
      expect(screen.getByText(trips[0].title)).toBeInTheDocument();
    });

    // Should show all trips
    trips.forEach((trip) => {
      expect(screen.getByText(trip.title)).toBeInTheDocument();
    });
  });
});
```

### Snapshot Tests

Use snapshot testing to detect UI changes:

```tsx
it('matches snapshot', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container).toMatchSnapshot();
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it.

2. **Use Testing Library Queries Wisely**:

   - Prefer `getByRole` over `getByTestId` when possible
   - Use `findBy` queries for async operations
   - Use `queryBy` when checking for absence

3. **Isolation**: Tests should not depend on each other. Reset the testing environment between tests.

4. **Mock Only What's Necessary**: Only mock external dependencies and services.

5. **Naming Conventions**:

   - `*.test.tsx` for standard tests
   - `*.unit.test.tsx` for unit tests
   - `*.integration.test.tsx` for integration tests
   - `*.component.test.tsx` for component tests

6. **Keep Tests Simple**: Each test should verify one specific behavior or use case.

7. **Set Up Test Data in Each Test**: Use the test data generators to create fresh test data in each test.

8. **Clean Up**: Always clean up side effects in `afterEach` or `afterAll` hooks.
