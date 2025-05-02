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
// In utils/supabase/unified.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Use this in server components
export async function getServerComponentClient(): Promise<TypedSupabaseClient> {
  try {
    const cookieStore = await cookies();
    return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.warn(`[supabase] Error accessing cookie ${name}:`, error);
            return undefined;
          }
        },
        // Server Components cannot set cookies
      },
    });
  } catch (error) {
    console.error('[supabase] Error creating server component client:', error);
    // Create a minimal client with no cookie access as fallback
    return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          return undefined;
        },
      },
    });
  }
}

// Use this to get the session in server components and API routes
export async function getServerSession() {
  try {
    const supabase = await getServerComponentClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error.message);
      return { data: { session: null } };
    }
    
    return { data: { session: data.session } };
  } catch (error) {
    console.error('Error getting server session:', error);
    return { data: { session: null } };
  }
}
```

**Best Practices**:

- Always use the correct client creation function for the environment:
  - `getServerComponentClient()` for server components
  - `getRouteHandlerClient()` for API routes
  - `getMiddlewareClient()` for middleware
  - `getBrowserClient()` for client components (via `components/auth-provider.tsx`)
- Use the unified helpers from `utils/supabase/unified.ts`
- Handle errors gracefully with proper status codes and messages
- Use constants from `utils/constants/database.ts` for table and field names

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

### 5. Database Access with Constants

Always use the constants from `utils/constants/database.ts` when accessing database tables and fields:

```tsx
import { TABLES, FIELDS } from '@/utils/constants/database';

// Access user trips
const { data, error } = await supabase
  .from(TABLES.TRIPS)
  .select(`*, ${TABLES.TRIP_MEMBERS}(*)`)
  .eq(`${TABLES.TRIP_MEMBERS}.${FIELDS.TRIP_MEMBERS.USER_ID}`, userId);
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
  const cookieStore = await cookies();
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

1. **"Not authenticated" redirects:** Often caused by cookie issues or session expiry. Check cookie configuration in unified.ts and ensure proper session handling.
2. **Redirect loops:** Can occur when redirect logic isn't properly handling authentication state. Add redirect counters or debug logs to track the flow.
3. **Auth state not updating:** The AuthProvider should update state when auth events occur. Check your event subscriptions.
4. **Server/client auth mismatch:** Ensure consistent session handling between server and client code.
5. **Next.js 15 route parameter errors:** Always await params objects before accessing properties.

Specific Trip Page Issues:

If experiencing issues with trip pages not loading:
• Ensure params are awaited before use: const { tripId } = await params;
• Check that the getServerSession() function is being used correctly
• Add diagnostic logging to see where authentication checks might be failing
• Verify redirect URLs are properly encoded

## Implementation Summary

Our authentication system:

• Uses Supabase Auth with secure cookie sessions via `@supabase/ssr`
• Provides a clean, maintainable AuthProvider implementation
• Has clear separation between client and server authentication
• Handles Next.js 15's async route parameters properly
• Includes comprehensive error handling and recovery
• Simplifies authentication checks in both client and server contexts
• Uses constants from database.ts for all database interactions
• Avoids complexity that leads to bugs
• Follows best practices for security and user experience
