# Authentication System Documentation

## Overview

The authentication system in withme.travel uses Supabase Auth with secure cookie-based sessions. It leverages Next.js 15's latest patterns and the `@supabase/ssr` library for robust, maintainable authentication.

The core architecture consists of:

- **Auth Provider**: A centralized React context (`components/auth-provider.tsx`) that manages auth state.
- **Server Utilities**: Helper functions (`utils/supabase/server.ts`) for authentication in server components and API routes using `@supabase/ssr`.
- **Client Utilities**: Helper functions (`utils/supabase/client.ts`) for authentication in client components using `@supabase/ssr`.
- **Middleware**: Handles session refresh and route protection (`middleware.ts`).
- **Profile Integration**: Automatic connection between auth users and profile data.
- **Error Handling**: Graceful error recovery, including handling for expired refresh tokens.

## Key Components and Best Practices

### 1. Auth Provider (`components/auth-provider.tsx`)

The Auth Provider is the heart of our client-side authentication system. It manages user sessions, handles state changes triggered by Supabase auth events, and provides authentication methods and state to client components via the `useAuth` hook.

```tsx
// In app/layout.tsx
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

- Automatically listens for Supabase auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED) to keep client state synchronized.
- User state includes profile data fetched upon successful authentication.
- Error handling is centralized within the provider and exposed via the `useAuth` hook.
- Uses a stable implementation without complex state management dependencies.

### 2. Server Authentication (`utils/supabase/server.ts`)

Server-side authentication relies on `@supabase/ssr` to create a Supabase client configured for server environments (Server Components, API Routes, Server Actions).

```typescript
// In utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
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
            // Handle potential errors setting cookies in server actions
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle potential errors removing cookies
          }
        },
      },
    }
  )
}
```

**Best Practices**:

- Always use the `cookies()` function from `next/headers` to get the cookie store.
- The `createServerClient` from `@supabase/ssr` handles cookie reading/writing securely.
- Reusable utility functions (like a hypothetical `getServerSession`) should use this client.
- Error handling within cookie operations ensures robustness.

### 3. Client Authentication (`utils/supabase/client.ts` & `useAuth`)

Client-side authentication uses a similar `@supabase/ssr` helper to create a browser-compatible client.

```typescript
// In utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

The `useAuth` hook (typically defined within or alongside `AuthProvider`) provides easy access to the client instance, authentication state (user, session, isLoading, error), and methods (signIn, signOut, etc.).

```tsx
// Example: Using auth in a client component
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
      <p>Welcome, {user.profile?.name || user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

**Best Practices**:

- Use the `createBrowserClient` for singleton client instance in the browser.
- Components using `useAuth` must have the `'use client'` directive.
- Handle loading and error states provided by `useAuth` for a smooth UX.

### 4. Middleware (`middleware.ts`)

The middleware plays a crucial role in session management and route protection.

```typescript
// In middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // IMPORTANT: Refresh session if expired - handles token refresh
  await supabase.auth.getSession()

  // Route protection logic (example)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response
}

export const config = {
  matcher: [
    // Routes to apply middleware
    '/dashboard/:path*',
    '/api/protected/:path*',
  ],
}
```

**Best Practices**:

- Use `@supabase/ssr`'s `createServerClient` configured for middleware cookie handling.
- Crucially, call `supabase.auth.getSession()` to ensure the session token is refreshed if necessary *before* any auth checks.
- Implement route protection logic based on `supabase.auth.getUser()`.
- Define the `matcher` config carefully to apply middleware only where needed.

### 5. Route Protection in Next.js 15

Protecting server components or pages involves using the server client.

```tsx
// In app/(authenticated)/dashboard/page.tsx
import { createServerComponentClient } from '@/utils/supabase/ssr-client' // Use correct client
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Await the client promise
  const supabase = await createServerComponentClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Please log in to view this page')
  }

  // Continue with the authenticated page...
  return <div>Welcome, {user.email}</div>
}
```

**Best Practices**:

- Use the server client (`createServerComponentClient`) for checks in Server Components.
- Redirect unauthenticated users appropriately.
- Remember to `await` dynamic route parameters if needed: `const { id } = await params;`

## Authentication Flow Summary

1.  **Login**: User submits credentials. Server action/API route uses server client to sign in, setting auth cookies.
2.  **Client Update**: `AuthProvider` detects `SIGNED_IN` event, updates client state.
3.  **Navigation**: User navigates to protected route.
4.  **Middleware**: Middleware runs, calls `getSession()` to refresh token if needed, checks auth status via `getUser()`, allows or redirects.
5.  **Server Component Access**: Protected server component uses server client to verify user via `getUser()`.
6.  **Client Component Access**: Protected client component uses `useAuth` hook to verify user.

## API Authentication Routes

The system provides key API routes:

- `/api/auth/login`: Handles login (can be replaced by Server Actions).
- `/api/auth/signup`: Handles registration (can be replaced by Server Actions).
- `/api/auth/logout`: Handles logout (can be replaced by Server Actions).
- `/api/auth/me`: Gets current user data (server-side).
- `/api/auth/clear-cookies`: Utility to force clear auth cookies.
- `/api/auth/forgot-password`, `/api/auth/reset-password`: Password recovery flows.

**Note:** When building API routes, ensure you use `await createApiRouteClient()` as detailed in the [API Routes & Server/Client Components Guide](docs/api-routes-server-client.md).

## Troubleshooting

- **"Not authenticated" errors / Redirect loops**: Often cookie issues. Ensure `middleware.ts` correctly calls `getSession()`. Check cookie domain/path settings. Use `/api/auth/clear-cookies` and browser dev tools to clear cookies.
- **Client/Server Mismatch**: Usually indicates `AuthProvider` isn't correctly syncing with Supabase events or middleware isn't refreshing tokens properly.
- **Next.js 15 Route Parameter Errors**: Always `await params;` before accessing properties in dynamic server routes.

## Implementation Summary

Our authentication system:

- Uses `@supabase/ssr` for unified and secure cookie handling across server, client, and middleware.
- Provides a stable `AuthProvider` for client state management.
- Ensures reliable session refreshes via middleware.
- Offers clear separation and utilities for client (`utils/supabase/client.ts`) and server (`utils/supabase/server.ts`) authentication.
- Includes robust error handling.

This approach ensures reliable, secure, and maintainable authentication aligned with Next.js best practices.
