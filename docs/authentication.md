# Authentication System Documentation

## Overview

The authentication system in withme.travel uses Supabase Auth with the `@supabase/ssr` library for user authentication and secure cookie-based session management. It leverages Next.js 15's latest patterns for robust and maintainable authentication.

**Note:** CSRF protection has been removed. The system now relies solely on Supabase Auth features and secure, HTTP-only cookies managed by `@supabase/ssr`. **Do not** implement custom CSRF tokens or validation.

The core architecture consists of:

- **Auth Provider**: A centralized React context (`components/auth-provider.tsx`) that manages client-side auth state using `@supabase/ssr`.
- **Server Utilities**: Helper functions (`utils/supabase/server.ts`) for authentication in server environments (Server Components, API Routes, Server Actions) using `@supabase/ssr`.
- **Client Utilities**: Helper functions (`utils/supabase/client.ts`) for authentication in client components using `@supabase/ssr`.
- **Middleware**: Handles session refresh and route protection (`middleware.ts`) using `@supabase/ssr`.
- **Profile Integration**: Automatic connection between auth users and profile data.
- **Error Handling**: Graceful error recovery, including handling for expired refresh tokens and an optional `AuthErrorBoundary`.

## Key Components and Best Practices

### 1. Auth Provider (`components/auth-provider.tsx`)

The Auth Provider is the heart of our client-side authentication system. It uses `createBrowserClient` from `@supabase/ssr` to initialize a Supabase client instance.

Key responsibilities:
- Manages client-side auth state (session, user, loading, errors).
- Listens for Supabase auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED) to keep client state synchronized with the server session managed via cookies.
- Fetches and integrates user profile data upon successful authentication.
- Provides authentication methods (signIn, signUp, signOut) and state via the `useAuth` hook.
- Handles session refresh events triggered by Supabase.

```tsx
// Example: Wrapping your app with AuthProvider
// In app/layout.tsx
import { AuthProvider } from '@/components/auth-provider';
import { AuthErrorBoundary } from '@/components/auth-error-boundary'; // Optional

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* AuthErrorBoundary can wrap parts or all of the app */}
          <AuthErrorBoundary>{children}</AuthErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Best Practices**:
- Ensure `AuthProvider` wraps all components that need access to auth state.
- The `useAuth` hook should be the primary way client components interact with auth state.

### 2. Server Authentication (`utils/supabase/server.ts`)

Server-side authentication relies on `@supabase/ssr`'s `createServerClient` helper. This function creates a Supabase client configured correctly for server environments, using the provided `cookies` object from `next/headers` to read and write auth cookies securely.

```typescript
// In utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase' // Your generated DB types

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>( // Use your Database type
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Example helper function (can be added to server.ts or used directly)
export async function getServerSession() {
  const supabase = createClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}
```

**Best Practices**:
- Always use the `cookies()` function from `next/headers` to get the cookie store in Server Components or Route Handlers.
- Use the client returned by `createClient()` for all server-side Supabase interactions (auth checks, data fetching).
- The `set` and `remove` cookie operations might throw errors in Server Components if middleware isn't also handling session refresh; these specific errors can often be safely ignored in that context.

### 3. Client Authentication (`utils/supabase/client.ts` & `useAuth`)

Client-side authentication uses `@supabase/ssr`'s `createBrowserClient` helper to create a browser-compatible singleton client instance.

```typescript
// In utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase' // Your generated DB types

export function createClient() {
  return createBrowserClient<Database>( // Use your Database type
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

The `useAuth` hook (defined within or alongside `AuthProvider`) provides easy access to the client instance, authentication state (user, session, isLoading, error), and methods (signIn, signOut, etc.).

```tsx
// Example: Using useAuth in a client component
'use client';
import { useAuth } from '@/components/auth-provider'; // Or wherever useAuth is defined

export default function ProfileButton() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) {
    return <SignInButton />;
  }

  return (
    <div>
      {/* Access profile data safely */}
      <p>Welcome, {user.profile?.name || user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

**Best Practices**:
- Use the `createBrowserClient` for the client-side singleton instance.
- Components using `useAuth` **must** have the `'use client'` directive.
- Always handle `isLoading` and `error` states from `useAuth` for a good UX.

### 4. Middleware (`middleware.ts`)

Middleware is essential for refreshing the user's session cookie before it expires and for protecting routes server-side before rendering.

```typescript
// In middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase' // Your generated DB types

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // IMPORTANT: Refresh session if expired - Must be called Supabase server client logic!
  // This keeps the server session in sync with the client
  await supabase.auth.getUser()

  // Optional: Route protection logic
  // const { data: { user } } = await supabase.auth.getUser(); // Already called above
  // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Best Practices**:
- Use `@supabase/ssr`'s `createServerClient` configured for middleware cookie handling (reading from `request.cookies`, writing to `response.cookies`).
- **Crucially**, call `supabase.auth.getUser()` (or `getSession()`) early in the middleware. This action handles the token refresh mechanism by reading/writing cookies via the handlers you provide.
- Implement route protection logic *after* the `getUser()` call if needed.
- Define the `matcher` config carefully to exclude static assets but include necessary pages and API routes.

### 5. Route Protection (Server Components / Route Handlers)

Protecting server-rendered pages or API routes involves using the server client created via `utils/supabase/server.ts`.

```tsx
// Example: Protecting a Server Component page
// In app/(authenticated)/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server' // Use our server client utility
import { redirect } from 'next/navigation'

// Add this if the page uses cookies/headers/searchParams
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient() // Use the utility

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Please log in to view this page')
  }

  // Continue with the authenticated page...
  return <div>Welcome, {user.email}</div>
}
```

**Best Practices**:
- Use the server client utility (`utils/supabase/server.ts`) for checks in Server Components and Route Handlers.
- Add `export const dynamic = 'force-dynamic'` to any Server Component page that uses `cookies()` or `headers()` (which includes our `createClient` server utility).
- Redirect unauthenticated users appropriately.
- Remember Next.js 15: `await params;` before accessing dynamic route parameters.

## Authentication Flow Summary

1.  **Login**: User submits credentials. Server Action/API Route uses server client (`createClient`) to sign in, setting auth cookies via `@supabase/ssr`.
2.  **Navigation/Refresh**: User navigates or page refreshes.
3.  **Middleware**: Middleware runs, calls `getUser()` which triggers `@supabase/ssr` to check/refresh the session cookie.
4.  **Server Component Render**: If accessing a protected Server Component, it uses `createClient()` to check `getUser()` based on the (potentially refreshed) cookie.
5.  **Client Hydration/Navigation**: `AuthProvider` initializes, reads the cookie state via `createBrowserClient`. It listens for `INITIAL_SESSION` and subsequent auth events (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`) to keep client state synchronized.
6.  **Client Component Access**: Client components use `useAuth` hook to access the synchronized state.

## API Authentication Routes

The system provides key API routes (consider migrating logic to Server Actions where appropriate):

- `/api/auth/login`: Handles login.
- `/api/auth/signup`: Handles registration.
- `/api/auth/logout`: Handles logout.
- `/api/auth/me`: Gets current user data (server-side).
- `/api/auth/clear-cookies`: Utility to force clear auth cookies (useful for troubleshooting).
- `/api/auth/forgot-password`, `/api/auth/reset-password`: Password recovery flows.

**Note:** Ensure API routes use the server client from `utils/supabase/server.ts` or the specific Route Handler client from `@supabase/ssr` if preferred.

## Troubleshooting

- **"Not authenticated" errors / Redirect loops**: Often cookie issues. Verify `middleware.ts` correctly calls `getUser()` or `getSession()`. Check cookie domain/path settings in Supabase config and `set` calls. Use `/api/auth/clear-cookies` and browser dev tools to clear cookies thoroughly. Check if `matcher` in `middleware.ts` is correctly configured.
- **Client/Server Mismatch**: Usually indicates `AuthProvider` isn't correctly syncing with Supabase events or middleware isn't refreshing tokens properly. Ensure `getUser()`/`getSession()` is called in middleware.
- **Dynamic Server Usage Errors**: Add `export const dynamic = 'force-dynamic'` to any Server Component page that uses `cookies()` or `headers()` (which includes our `createClient` server utility).
- **Redirect Chains (e.g., on trip pages)**: If experiencing infinite redirects:
    - Check redirect logic in middleware and pages.
    - Ensure redirect parameters (like `redirectTo` or custom counters) are correctly handled and don't create loops.
    - Verify protected routes aren't causing unexpected additional redirects.

## Implementation Summary

Our authentication system:

- Uses `@supabase/ssr` for unified and secure cookie handling across server, client, and middleware.
- Provides a stable `AuthProvider` for client state management synchronized via auth events.
- Ensures reliable session refreshes via middleware calling `getUser()`/`getSession()`.
- Offers clear separation and utilities for client (`utils/supabase/client.ts`) and server (`utils/supabase/server.ts`) authentication.
- Removed custom CSRF implementation, relying on Supabase defaults and secure cookies.
- Includes robust error handling and troubleshooting utilities.

This approach ensures reliable, secure, and maintainable authentication aligned with Next.js & Supabase best practices.
