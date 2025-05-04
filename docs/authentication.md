# Authentication System Documentation

## Overview

The authentication system in withme.travel uses Supabase Auth with secure cookie-based sessions. It leverages Next.js 15's latest patterns and `@supabase/ssr` for robust, maintainable authentication.

The core architecture consists of:

- **Auth Provider**: A centralized React context that manages auth state (now using `supabase.auth.getUser()` for robust, SSR/client-safe user state)
- **Server Utilities**: Helper functions for authentication in server components and API routes
- **Client Hooks**: Easy-to-use hooks for authentication in client components
- **Profile Integration**: Automatic connection between auth users and profile data
- **Error Handling**: Graceful error recovery for authentication failures

## Recent Updates (May 3-4, 2024)

### Unified Navigation & Robust Auth State

- The navigation bar is now a single, unified, fully responsive component for both desktop and mobile. All navigation logic and links are managed in one place, eliminating duplicate code and reducing bugs.
- The user menu has been rebuilt from scratch. It now:
  - Handles all authentication states: loading (shows skeleton/avatar), logged out (shows sign-in), and logged in (shows user info and menu)
  - Uses emoji-based icons for a friendlier, more accessible UI
  - Is type-safe and robust, with defensive programming to prevent infinite loading or UI bugs
- The `AuthProvider` now uses `supabase.auth.getUser()` (not `getSession()`) for initialization and auth state changes. This ensures the user state is always up-to-date and avoids SSR/client mismatches that can cause infinite loading or stale UI.
- Debug logging has been added to the AuthProvider to help diagnose issues with auth state, Supabase client initialization, and user profile loading.

### Troubleshooting Infinite Loading Avatars/User Menus

- If you see an infinite loading avatar or user menu after a hard refresh, check that your `AuthProvider` is using `supabase.auth.getUser()` for initialization and state changes. Using `getSession()` can cause stale or missing user state in Next.js App Router, especially after navigation or SSR hydration.
- Switching to `getUser()` resolves these issues and ensures the UI always reflects the correct authentication state.

## Key Components and Best Practices

### 1. Auth Provider (`./components/auth-provider.tsx`)

The Auth Provider is the heart of our authentication system. It manages user sessions, handles state, and provides authentication methods to client components.

**Key best practices:**
- Always use `supabase.auth.getUser()` for client-side user state (never `getSession()`)
- Handle all possible states: loading, logged out, logged in, and error
- Use a single provider for all auth state and actions
- Add debug logging for initialization, errors, and state changes

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

---

### 2. Unified Navigation & User Menu

- The navigation bar and user menu are now managed in a single, type-safe component that adapts responsively for desktop and mobile.
- The user menu uses emoji icons and robustly handles all auth states, including loading (shows a skeleton/avatar), logged out (shows sign-in), and logged in (shows user info and menu).
- All navigation and auth state logic is centralized, making it easier to maintain and debug.

---

### 3. Troubleshooting & Debugging

- If you encounter infinite loading in the avatar or user menu, ensure your AuthProvider uses `supabase.auth.getUser()` for all user state logic.
- Use debug logs to trace initialization, errors, and state changes in the auth flow.
- Defensive programming in the provider ensures `isLoading` is always set correctly, preventing UI from getting stuck in a loading state.

---

## Recent Learnings (May 2024)

- **SSR/Client Auth Mismatch:** Using `supabase.auth.getSession()` can cause stale or missing user state in Next.js App Router. `supabase.auth.getUser()` is the recommended approach for client-side auth.
- **Centralized Auth & Navigation:** Managing all auth and navigation state in a single provider and component reduces bugs and makes the UI more reliable.
- **Defensive State Management:** Always handle all possible states (loading, error, null, valid) and ensure state transitions are robust.
- **Debug Logging:** Adding clear debug logs for all critical auth and navigation state changes speeds up troubleshooting and helps catch subtle bugs.
- **UI/UX:** Consistent, accessible, and delightful navigation and user menu improve user trust and experience.

---

### 4. Server Authentication

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

### 5. Client Authentication Hook

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

### 6. Route Protection in Next.js 15

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

### 7. Database Access with Constants

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

### 1. Route Parameters Are Not Promises

Important update: In the latest version, route parameters are no longer Promises that need to be awaited:

```tsx
// DEPRECATED - NO LONGER CORRECT IN LATEST NEXT.JS
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // This was previously required
}

// CURRENT CORRECT APPROACH
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params; // Direct access, no await needed
}
```

This also applies to API route handlers:

```tsx
// DEPRECATED - NO LONGER CORRECT
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  const { tripId } = await params;
  // ...
}

// CURRENT CORRECT APPROACH
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = params;
  // ...
}
```

### 2. Supabase Client Initialization

Our Supabase client helper functions are now async and must be awaited:

```tsx
// CORRECT - await the async function
const supabase = await createRouteHandlerClient();
const supabase = await createServerComponentClient();

// INCORRECT - not awaiting the async function
const supabase = createRouteHandlerClient();
```

This is necessary because the underlying cookies() and headers() functions in Next.js 15 are asynchronous.

### 3. Cookie Handling

Next.js 15 has updated the cookies() and headers() APIs to be asynchronous:

```tsx
import { cookies, headers } from 'next/headers';

export async function GET() {
  // CORRECT - await the async functions
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // Use cookieStore and headersList
  const cookieValue = cookieStore.get('my-cookie')?.value;
  const userAgent = headersList.get('user-agent');
  
  // INCORRECT - not awaiting (will cause TypeScript errors)
  const badCookieStore = cookies();
  const badHeadersList = headers();
}
```

This change affects our authentication utilities, which have been updated to handle these asynchronous calls properly.

### 4. Session Management in API Routes

API routes should use consistent authentication patterns:

```tsx
export async function GET(request: NextRequest): Promise<NextResponse> {
  const {
    data: { session },
  } = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
