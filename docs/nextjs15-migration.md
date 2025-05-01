# Next.js 15 Migration Guide

## Dynamic Route Parameters Are Now Promises

In Next.js 15, one of the most impactful changes is that dynamic route parameters in API route handlers are now delivered as Promises that must be awaited.

### The Impact

This change affects all route handlers that use dynamic segments in their paths, such as:

- `/api/trips/[tripId]/route.ts`
- `/api/destinations/[id]/reviews/route.ts`
- Any other route with dynamic parameters using `[paramName]` syntax

### Example of the Issue

**Before Next.js 15** (worked fine):

```typescript
// app/api/trips/[tripId]/route.ts
export async function GET(request: Request, { params }: { params: { tripId: string } }) {
  const { tripId } = params; // This worked in Next.js 14 and earlier
  // Use tripId directly
}
```

**With Next.js 15** (causes errors):

```typescript
// app/api/trips/[tripId]/route.ts
export async function GET(request: Request, { params }: { params: { tripId: string } }) {
  const { tripId } = params; // Error! tripId is a Promise in Next.js 15
  // Using tripId directly will cause TypeErrors
}
```

### Required Fix

You must now await the parameters before using them:

```typescript
// app/api/trips/[tripId]/route.ts
export async function GET(request: Request, { params }: { params: { tripId: string } }) {
  // Option 1: Await the entire params object
  const resolvedParams = await params;
  const { tripId } = resolvedParams;

  // OR Option 2: Await just the specific parameter
  const tripId = await params.tripId;

  // Now use tripId safely
}
```

### Common Patterns That Need Updating

1. **Multiple parameters extraction:**

   ```typescript
   // BEFORE
   const { tripId, itemId } = params;

   // AFTER
   const tripId = await params.tripId;
   const itemId = await params.itemId;
   // OR
   const resolvedParams = await params;
   const { tripId, itemId } = resolvedParams;
   ```

2. **Early parameter validation:**

   ```typescript
   // BEFORE
   if (!params.tripId) {
     return new Response(JSON.stringify({ error: 'Missing tripId' }), { status: 400 });
   }

   // AFTER
   const tripId = await params.tripId;
   if (!tripId) {
     return new Response(JSON.stringify({ error: 'Missing tripId' }), { status: 400 });
   }
   ```

3. **Multiple routes with the same parameter:**
   You need to await parameters in every route handler separately.

### Automatic Fix Script

You can use the following script to automatically update your route handlers to await dynamic parameters:

```typescript
// scripts/fix-route-params.ts
import { promises as fs } from 'fs';
import path from 'path';
import glob from 'glob';

async function fixRouteParams() {
  // Find all route.ts files in the app directory
  const routeFiles = glob.sync('app/**/route.ts');

  for (const file of routeFiles) {
    // Check if this is a dynamic route
    const dirPath = path.dirname(file);
    const isDynamicRoute = dirPath.includes('[') && dirPath.includes(']');

    if (!isDynamicRoute) continue;

    let content = await fs.readFile(file, 'utf-8');

    // Check if the file has a route handler that uses params
    if (content.includes('{ params }')) {
      // Add code to await params
      content = content.replace(
        /const\s+\{\s*([^}]+)\s*\}\s*=\s*params;/g,
        'const resolvedParams = await params;\nconst { $1 } = resolvedParams;'
      );

      // Save the modified file
      await fs.writeFile(file, content, 'utf-8');
      console.log(`Fixed: ${file}`);
    }
  }
}

fixRouteParams().catch(console.error);
```

### Other Changes in Next.js 15

While the params as Promises change is one of the most disruptive, there are other important changes in Next.js 15:

1. **FormData is now always available:**
   You can now use `await request.formData()` in all route handlers without checking for content-type.

2. **TypeScript types have been updated:**
   The types for route handlers have been updated to reflect the Promise-based params.

### Further Reading

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Official Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [GitHub Discussion about Route Params Change](https://github.com/vercel/next.js/discussions/58565)

## Authentication Considerations with `@supabase/ssr`

While `@supabase/ssr` significantly simplifies Supabase integration with Next.js, especially concerning cookie management and server/client/middleware contexts, it's important to ensure its correct implementation, particularly in the middleware.

### Key Implementation Point: Middleware Session Refresh

The most critical aspect for stable authentication is ensuring the session is refreshed correctly within `middleware.ts`. This prevents issues related to stale tokens.

```typescript
// In middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { /* ... cookie handlers ... */ },
    }
  )

  // IMPORTANT: Refresh session if expired *before* auth checks
  // This line handles token refreshes automatically.
  await supabase.auth.getSession()

  // Now perform auth checks
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response
}
```

**Why this is crucial:** Calling `supabase.auth.getSession()` *before* `supabase.auth.getUser()` allows the `@supabase/ssr` library to handle the token refresh mechanism seamlessly if the access token has expired but a valid refresh token exists. This prevents many common authentication failures.

### Previous Authentication Issues (Resolved)

Older versions of this guide may have mentioned issues like:

- "Invalid Refresh Token: Refresh Token Not Found" errors.
- Conflicts with Sentry instrumentation.
- Stale auth states requiring manual cookie clearing.

**These issues have been largely resolved by:**

1.  **Adopting `@supabase/ssr`:** This library provides the standard, robust way to handle Supabase auth with Next.js App Router.
2.  **Correct Middleware Implementation:** Ensuring `getSession()` is called in the middleware as shown above.
3.  **Using Server and Client Helpers:** Consistently using `utils/supabase/server.ts` and `utils/supabase/client.ts` in their respective contexts.
4.  **Stable AuthProvider:** Utilizing a reliable `AuthProvider` (`components/auth-provider.tsx`) that listens to Supabase auth events.

If you encounter authentication problems, first ensure your setup matches the patterns described in `docs/authentication.md` and that you are using the `@supabase/ssr` library correctly.
