# Authentication System Documentation

## Overview

The authentication system in withme.travel uses Supabase Auth for user authentication and session management. It is designed to work with Next.js 13+ App Router, supporting both client and server-side authentication flows. The system includes session management, profile data fetching, and seamless integration with the UI components.

The core architecture consists of:

- **Auth Provider**: A React context provider that manages auth state
- **Client-side hooks**: For components to access auth data
- **Server-side utilities**: For API routes and server components
- **Profile integration**: To connect auth users with profile data

## Key Components and Responsibilities

### Auth Provider (`./components/auth-provider.tsx`)

This is the central component of the authentication system. It:

- Initializes the Supabase client
- Manages auth state (session, user, loading, errors)
- Provides authentication methods (signIn, signUp, signOut)
- Handles session refresh and expiry
- Manages profile data fetching
- Provides a context for client components

```tsx
// Example: Wrapping your app with AuthProvider
// In layout.tsx
import { AuthProvider } from "@/components/auth-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### useAuth Hook

A custom hook that provides access to the auth context in client components.

```tsx
// Example: Using useAuth in a client component
"use client";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.profile?.name || user.email}</div>;
}
```

### Server-side Auth Utilities

Utilities for verifying authentication on the server side, including:

- API route protection
- Server component data fetching
- Session verification

```tsx
// Example: Protected API route
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Process authorized request
}
```

## Common Pitfalls and How to Avoid Them

### 1. Client/Server Component Confusion

**Issue**: Using hooks in server components or not adding 'use client' directive.

**Solution**: Always add 'use client' at the top of files that use React hooks, including `useAuth`.

```tsx
// CORRECT:
"use client";
import { useAuth } from "@/components/auth-provider";
```

### 2. Missing Type Definitions

**Issue**: Missing or incorrect type definitions leading to type errors.

**Solution**: Always use the provided types and avoid type assertions when possible.

```tsx
// AVOID:
const auth = useAuth() as AuthContextType;

// PREFER:
const { user, session } = useAuth();
```

### 3. Race Conditions in Auth State

**Issue**: Acting on auth state before it's fully loaded.

**Solution**: Always check the `isLoading` state before making decisions based on auth state.

```tsx
// CORRECT:
const { user, isLoading } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}

// Now it's safe to use user data
```

### 4. Session Expiry Handling

**Issue**: Not handling session expiry or refresh properly.

**Solution**: Let the AuthProvider handle session refreshes automatically and respond to auth state changes.

## Best Practices for Working with Auth

### 1. Separate Authentication Logic from UI

Keep authentication logic separate from UI components. Use the `useAuth` hook to access authentication state and methods, but keep complex auth logic in dedicated functions or hooks.

### 2. Use Loading States Appropriately

Always handle loading states to provide a good user experience:

```tsx
const { isLoading, user } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}

if (!user) {
  return <SignInPrompt />;
}

return <AuthenticatedContent />;
```

### 3. Handle Errors Gracefully

Always handle authentication errors and provide helpful error messages:

```tsx
const { error, signIn } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await signIn(email, password);
  } catch (error) {
    setLocalError("Sign in failed. Please check your credentials.");
  }
};

// Display error from auth state if present
{error && <ErrorMessage>{error.message}</ErrorMessage>}
```

### 4. Centralize Auth-Related Types

Keep all auth-related types in one place (ideally in the auth-provider file) and reuse them consistently.

## Troubleshooting Guide

### "Export useAuth doesn't exist in target module"

**Possible causes**:
- The `useAuth` function is not properly exported from auth-provider.tsx
- There's a circular dependency issue
- Build cache issues

**Solutions**:
1. Ensure `useAuth` has the `export` keyword in `auth-provider.tsx`
2. Check for circular imports
3. Try clearing the Next.js cache: `rm -rf .next` and rebuild

### "Must use 'Client Component'"

**Possible causes**:
- Using `useAuth` in a server component

**Solutions**:
1. Add `"use client"` at the top of your file
2. Move auth-dependent code to a separate client component

### Auth state not updating properly

**Possible causes**:
- Race conditions in effect hooks
- Multiple instances of AuthProvider

**Solutions**:
1. Check React component hierarchy to ensure only one AuthProvider exists
2. Use proper dependency arrays in useEffect hooks

## Guidelines for Client vs Server Components

### Client Components (with 'use client')

- Can use the `useAuth` hook directly
- Can access authentication state and methods
- Can perform UI interactions based on auth state

### Server Components

- **Cannot** use the `useAuth` hook directly
- Must use server-side authentication checks
- Can fetch authentication data using Supabase server client
- For auth-dependent UI, pass server-fetched data to client components

```tsx
// Example: Server component fetching auth data
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ClientAuthUI from "./client-auth-ui";

export default async function ServerPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  // Pass session to client component
  return <ClientAuthUI initialSession={session} />;
}
```

## Type Safety Considerations

### 1. Using AuthContextType

The `AuthContextType` interface defines the structure of the auth context. Always use this type when working with auth context values for type safety.

```tsx
import type { AuthContextType } from "@/components/auth-provider";

// When creating a custom hook that uses auth
function useCustomAuthFeature() {
  const auth = useAuth();
  // auth will have the correct typing from AuthContextType
}
```

### 2. User and Profile Types

The auth system uses two important types:
- `AppUser`: Enhanced Supabase User with profile data
- `UserProfile`: The user's profile data from the database

Always use these types for type safety when working with user data:

```tsx
import type { AppUser, UserProfile } from "@/components/auth-provider";

function MyComponent() {
  const { user } = useAuth();
  
  // user will be AppUser | null
  // user?.profile will be UserProfile | null
}
```

### 3. Avoiding Type Assertions

Avoid using type assertions (`as`) when working with auth data. The types are designed to work properly with TypeScript's type inference:

```tsx
// AVOID:
const auth = useAuth() as AuthContextType;

// PREFER:
const auth = useAuth();
// TypeScript will infer the correct type
```

## Maintenance and Future Improvements

To keep the authentication system maintainable:

1. Regularly update Supabase dependencies
2. Keep the auth provider logic focused on authentication only
3. Add comprehensive tests for auth flows
4. Document any changes to the auth system in this document
5. Consider extracting complex auth logic into separate utilities

By following these guidelines, you'll maintain a robust authentication system that is both type-safe and easy to work with across your application.

## Testing Authentication

Testing authentication is crucial for maintaining a reliable application. Here are guidelines for properly testing auth-related functionality.

### Setting Up Test Environment

Create mock implementations of the auth provider and Supabase client for testing:

```tsx
// __tests__/auth/setup.ts
import { AuthContextType } from "@/components/auth-provider";
import { createContext } from "react";

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshSession: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn().mockReturnValue({ 
      data: { subscription: { unsubscribe: jest.fn() } }
    }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Mock auth context for testing
export const mockAuthContext: AuthContextType = {
  supabase: mockSupabaseClient as any,
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  refreshSession: jest.fn(),
};

// Create a mock auth context
export const MockAuthContext = createContext<AuthContextType>(mockAuthContext);

// Mock auth provider for testing
export function MockAuthProvider({ 
  children, 
  value = mockAuthContext 
}: { 
  children: React.ReactNode, 
  value?: Partial<AuthContextType> 
}) {
  const mergedValue = { ...mockAuthContext, ...value };
  return (
    <MockAuthContext.Provider value={mergedValue}>
      {children}
    </MockAuthContext.Provider>
  );
}
```

### Testing Components with Auth Dependencies

Use the mock auth provider when testing components that depend on authentication:

```tsx
// __tests__/auth/auth-provider.test.tsx
import { render, screen } from '@testing-library/react';
import { MockAuthProvider } from './setup';
import ProfileComponent from '@/components/profile-component';

describe('ProfileComponent', () => {
  test('displays loading state', () => {
    render(
      <MockAuthProvider value={{ isLoading: true }}>
        <ProfileComponent />
      </MockAuthProvider>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  test('displays user data when authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      profile: {
        id: '123',
        name: 'Test User',
        avatar_url: null,
        username: 'testuser',
        is_admin: false,
      }
    };
    
    render(
      <MockAuthProvider value={{ user: mockUser as any, isLoading: false }}>
        <ProfileComponent />
      </MockAuthProvider>
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
```

### Testing Auth Hooks

Test custom hooks that use auth context:

```tsx
// __tests__/auth/auth-hooks.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { MockAuthProvider, mockAuthContext } from './setup';
import { useAuth } from '@/components/auth-provider';

describe('useAuth hook', () => {
  test('provides auth context values', () => {
    const wrapper = ({ children }) => (
      <MockAuthProvider>{children}</MockAuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.signIn).toBe('function');
  });
  
  test('signIn calls supabase auth method', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      data: { user: { id: '123' }, session: { access_token: 'token' } },
      error: null
    });
    
    const wrapper = ({ children }) => (
      <MockAuthProvider value={{ signIn: mockSignIn }}>
        {children}
      </MockAuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });
    
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
  });
});
```

### Testing Protected Routes

Test components that have auth-based routing logic:

```tsx
// __tests__/auth/protected-route.test.tsx
import { render, screen } from '@testing-library/react';
import { MockAuthProvider } from './setup';
import ProtectedPage from '@/app/protected/page';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ProtectedPage', () => {
  const mockRouter = { push: jest.fn(), replace: jest.fn() };
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });
  
  test('redirects to login when not authenticated', () => {
    render(
      <MockAuthProvider value={{ user: null, isLoading: false }}>
        <ProtectedPage />
      </MockAuthProvider>
    );
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
  });
  
  test('displays content when authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      profile: { name: 'Test User' }
    };
    
    render(
      <MockAuthProvider value={{ user: mockUser as any, isLoading: false }}>
        <ProtectedPage />
      </MockAuthProvider>
    );
    
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
  
  test('shows loading state', () => {
    render(
      <MockAuthProvider value={{ isLoading: true }}>
        <ProtectedPage />
      </MockAuthProvider>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
```

### Testing Error Handling

Test how components handle authentication errors:

```tsx
// Example test for error handling
test('displays error message when sign-in fails', async () => {
  const mockError = new Error('Invalid credentials');
  const mockSignIn = jest.fn().mockRejectedValue(mockError);
  
  render(
    <MockAuthProvider value={{ signIn: mockSignIn, error: mockError }}>
      <LoginForm />
    </MockAuthProvider>
  );
  
  // Simulate form submission
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password' },
  });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  
  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
```

### Integration Testing Authentication Flows

For integration tests, you might want to test complete authentication flows:

1. Set up a test database with known credentials
2. Use Cypress or similar tools for E2E testing
3. Test the complete sign-in, sign-up, and sign-out flows

Example Cypress test:

```javascript
// cypress/e2e/auth.spec.js
describe('Authentication Flow', () => {
  it('allows a user to sign in', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('testpassword');
    cy.get('button[type="submit"]').click();
    
    // Check that the user is redirected to the dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Test User');
  });
  
  it('handles invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Check that error message is displayed
    cy.contains('Invalid login credentials');
    cy.url().should('include', '/login');
  });
});
```

### Best Practices for Auth Testing

1. **Use mocks for external services**: Always mock Supabase authentication for unit and component tests
2. **Test all states**: Test loading, authenticated, unauthenticated, and error states
3. **Test redirects**: Verify that protected routes redirect unauthenticated users
4. **Test edge cases**: Session expiry, token refresh, network errors
5. **Separate unit and integration tests**: Use unit tests for components and integration tests for full flows

By following these testing practices, you can ensure the authentication system remains stable and prevents regressions as the application evolves.

