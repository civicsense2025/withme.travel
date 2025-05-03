import { createClient } from '@supabase/supabase-js';

// Type for mocked supabase methods
interface MockedSupabaseMethod {
  mockReturnValue: (value: any) => MockedSupabaseMethod;
  mockResolvedValue: (value: any) => MockedSupabaseMethod;
  mockRejectedValue: (value: any) => MockedSupabaseMethod;
  mockImplementation: (fn: (...args: any[]) => any) => MockedSupabaseMethod;
  [key: string]: any; // Add index signature for dynamic access
}

// Base mock for chained supabase methods
const createMockChain = (): MockedSupabaseMethod => {
  const mock: any = {
    mockReturnValue: (value: any) => {
      mock.mockImplementation(() => value);
      return mock;
    },
    mockResolvedValue: (value: any) => {
      mock.mockImplementation(() => Promise.resolve(value));
      return mock;
    },
    mockRejectedValue: (value: any) => {
      mock.mockImplementation(() => Promise.reject(value));
      return mock;
    },
    mockImplementation: (fn: (...args: any[]) => any) => {
      mock.implementation = fn;
      return mock;
    }
  };

  // Make the mock function itself callable
  const mockFn: MockedSupabaseMethod = ((...args: any[]) => {
    if (mock.implementation) {
      return mock.implementation(...args);
    }
    return mock;
  }) as unknown as MockedSupabaseMethod;

  // Add the mock methods to the function
  Object.assign(mockFn, mock);

  // Add chaining methods that are commonly used with Supabase
  const chainMethods = [
    'select',
    'insert',
    'update',
    'delete',
    'upsert',
    'eq',
    'neq',
    'gt',
    'lt',
    'gte',
    'lte',
    'like',
    'ilike',
    'is',
    'in',
    'contains',
    'containedBy',
    'range',
    'overlaps',
    'textSearch',
    'match',
    'not',
    'filter',
    'or',
    'and',
    'order',
    'limit',
    'range',
    'single',
    'maybeSingle',
    'csv',
    'from',
  ];

  chainMethods.forEach((method) => {
    mockFn[method] = createMockChain();
  });

  return mockFn;
};

/**
 * Creates a mock Supabase client for testing
 *
 * @returns Mocked Supabase client with Jest mock methods
 
 */

export const createMockSupabaseClient = () => {
  // Create a base mock object
  const mockClient: any = {
    from: jest.fn().mockImplementation(() => {
      const tableMock: any = createMockChain();
      return tableMock;
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    storage: {
      from: jest.fn().mockImplementation(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest
          .fn()
          .mockReturnValue({ data: { publicUrl: 'https://example.com/test-image.jpg' } }),
      })),
    },
    channel: jest.fn().mockImplementation((name) => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockResolvedValue(null),
      unsubscribe: jest.fn().mockResolvedValue(null),
      name,
    })),
  };

  // Add additional mock functions as needed for your specific tests
  return mockClient;
};

/**
 * Jest mock implementation for the createClient function from @supabase/supabase-js
 *
 * Use this in your jest.mock() calls
 */

export const mockSupabaseCreateClient = () => {
  return createMockSupabaseClient();
};

/**
 * Set up Supabase mocking for a test file
 *
 * @example
 * // In your test file:
 * jest.mock('@/utils/supabase/client', () => ({
 *   createClient: mockSupabaseCreateClient,
 * }));
 */

export const setupSupabaseMocks = () => {
  jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockImplementation(mockSupabaseCreateClient),
  }));
};

/**
 * Helper to mock a successful Supabase response
 *
 * @param data The data to include in the response
 * @returns Mocked Supabase response object
 
 */

export const mockSupabaseSuccess = (data: any) => ({
  data,
  error: null,
});

/**
 * Helper to mock a failed Supabase response
 *
 * @param message Error message
 * @param code Optional error code
 * @returns Mocked Supabase error response object
 
 */

export const mockSupabaseError = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code,
  },
});
