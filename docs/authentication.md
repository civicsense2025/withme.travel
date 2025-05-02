# Authentication System Documentation

## Overview

The authentication system in withme.travel uses Supabase Auth with secure cookie-based sessions. It leverages Next.js 15's latest patterns and `@supabase/ssr` for robust, maintainable authentication.

The core architecture consists of:

- **Auth Provider**: A centralized React context that manages auth state
- **Server Utilities**: Helper functions for authentication in server components and API routes
- **Client Hooks**: Easy-to-use hooks for authentication in client components
- **Profile Integration**: Automatic connection between auth users and profile data
- **Error Handling**: Graceful error recovery for authentication failures

## Key Components and Best Practices

### 1. Auth Provider (`./components/auth-provider.tsx`)

The Auth Provider is the heart of our authentication system. It manages user sessions, handles state, and provides authentication methods to client components.

```tsx
// In layout.tsx
import { AuthProvider } from '@/components/auth-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**Best Practices**:

- The provider should handle session refreshes automatically
- User state should include profile data when available
- Error handling should be consistent and user-friendly
- Use a simple, maintainable implementation without complex state management

### 2. Server Authentication

Server-side authentication in Next.js 15 requires proper cookie handling and session management. We provide utility functions that make this easy:

```tsx
// In utils/supabase/server.ts
import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Use this in server components
export async function getServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
}

// Use this to get the session in server components and API routes
export async function getServerSession() {
  const supabase = await getServerClient();
  return await supabase.auth.getSession();
}
```

**Best Practices**:

- Always use the correct client creation function for the environment:
  - `createServerComponentClient` for server components
  - `createRouteHandlerClient` for API routes
  - `createMiddlewareClient` for middleware
  - `createBrowserClient` for client components (via `components/auth-provider.tsx`)
- Set proper cookie handling for each environment
- Create reusable utility functions for common auth tasks
- Handle errors gracefully with proper status codes and messages

### 3. Client Authentication Hook

The `useAuth` hook provides simple access to authentication state and methods in client components:

```tsx
// Example: Using auth in a client component
'use client';
import { useAuth } from '@/components/auth-provider';

export default function ProfileButton() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) {
    return <SignInButton />;
  }

  return (
    <div>
      <p>Welcome, {user.profile?.name || user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

**Best Practices**:

- Always add 'use client' directive in components using the hook
- Handle loading states for better user experience
- Provide clear error messages for authentication failures
- Extract complex auth logic into separate functions

### 4. Route Protection in Next.js 15

In Next.js 15, protecting routes requires special handling, especially with dynamic routes:

```tsx
// In app/protected/[id]/page.tsx
export default async function ProtectedPage({ params }: { params: Promise<{ id: string }> }) {
  // Must await params in Next.js 15 before using them
  const { id } = await params;

  // Check authentication
  const {
    data: { session },
  } = await getServerSession();

  if (!session) {
    // Redirect to login
    redirect(`/login?redirectTo=${encodeURIComponent(`/protected/${id}`)}`);
  }

  // Continue with the authenticated page...
}
```

**Best Practices**:

- Always await dynamic route parameters before using them in Next.js 15
- Use proper encoding for redirect URLs
- Create reusable auth check functions
- Add detailed logging for debugging auth issues

### 5. Authentication in Middleware

Middleware is a critical part of the authentication system, especially for protecting routes and refreshing sessions:

```tsx
// In middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createMiddlewareClient({ req: request, res: response });

  // CRITICAL: This refreshes the session if needed
  await supabase.auth.getSession();

  // Now perform auth checks
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes check
  if (!user && request.nextUrl.pathname.startsWith('/trips')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/trips/:path*', '/dashboard/:path*'],
};
```

**Best Practices**:

- Always call `supabase.auth.getSession()` at the start to refresh tokens if needed
- Use the correct matcher for protected routes
- Return the modified response with updated cookies

## Common Authentication Patterns

### Handling Authentication in Client vs. Server Components

**Server Components**

Server components cannot use hooks, but can perform direct authentication checks:

```tsx
// Server component
import { getServerSession } from '@/utils/supabase/server';

export default async function ServerComponent() {
  const {
    data: { session },
  } = await getServerSession();

  if (!session) {
    return <NotAuthenticatedUI />;
  }

  return <AuthenticatedUI userId={session.user.id} />;
}
```

**Client Components**

Client components can use the useAuth hook:

```tsx
'use client';
import { useAuth } from '@/components/auth-provider';

export default function ClientComponent() {
  const { user, signIn } = useAuth();

  // Use user data and auth methods...
}
```

### Authentication Error Handling

Proper error handling is crucial for a good user experience:

```tsx
// In a client component form
const handleLogin = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    await signIn(email, password);
    // Success - redirect or update UI
  } catch (error) {
    // Extract readable error message
    const message = error.message || 'Failed to sign in';
    setError(message.includes('credentials') ? 'Invalid email or password' : message);
  } finally {
    setLoading(false);
  }
};
```

Server-side error handling:

```tsx
// In a server action or API route
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Success
} catch (error) {
  console.error('Authentication error:', error);
  // Return appropriate error response
}
```

## Specific Next.js 15 Considerations

### 1. Awaiting Dynamic Route Parameters

Next.js 15 requires you to await route parameters before using them:

```tsx
// BEFORE (Next.js 14)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id; // Works in Next.js 14
}

// AFTER (Next.js 15)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Required in Next.js 15
}
```

### 2. Cookie Handling

Next.js 15 has improved cookie handling through the cookies() API:

```tsx
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  // Use cookieStore to get auth cookies
}
```

### 3. Session Management in API Routes

API routes should use consistent authentication patterns:

```tsx
export async function GET(request: Request) {
  const {
    data: { session },
  } = await getServerSession();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Continue with authenticated request
}
```

## Offline Support Considerations

With our new service worker implementation, authentication has some additional considerations:

1. **Token Storage:** Auth tokens are securely stored in cookies that aren't accessible to the service worker
2. **Offline Actions:** We provide clear feedback to users when authentication is required but offline
3. **Queued Actions:** Authenticated actions performed while offline are queued for processing when connectivity is restored

## Troubleshooting

Common Issues:

1. **"Not authenticated" redirects:** Often caused by cookie issues or session expiry. Check cookie configuration in server.ts and ensure proper session handling.
2. **Redirect loops:** Can occur when redirect logic isn't properly handling authentication state. Add redirect counters or debug logs to track the flow.
3. **Auth state not updating:** The AuthProvider should update state when auth events occur. Check your event subscriptions.
4. **Server/client auth mismatch:** Ensure consistent session handling between server and client code.
5. **Next.js 15 route parameter errors:** Always await params objects before accessing properties.

Specific Trip Page Issues:

If experiencing issues with trip pages not loading:
• Ensure params are awaited before use: const { tripId } = await params;
• Check that the getServerSession() function is being used correctly
• Add diagnostic logging to see where authentiation checks might be failing
• Verify redirect URLs are properly encoded

## Implementation Summary

Our authentication system:

• Uses Supabase Auth with secure cookie sessions via `@supabase/ssr`
• Provides a clean, maintainable AuthProvider implementation
• Has clear separation between client and server authentication
• Handles Next.js 15's async route parameters properly
• Includes comprehensive error handling and recovery
• Simplifies authentication checks in both client and server contexts
• Avoids complexity that leads to bugs (no refresh locks, counters, etc.)
• Follows best practices for security and user experience
