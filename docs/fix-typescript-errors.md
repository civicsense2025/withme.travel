# Fixing TypeScript Errors in API Routes

This document outlines the common patterns to fix TypeScript errors in API routes, specifically focusing on route handler parameters, cookie handling, and Supabase client initialization.

## Common Errors

The most common errors seen in API routes are:

1. **Async route parameters**: Route handlers incorrectly treating params as Promise
2. **Supabase client initialization**: Incorrectly awaiting createRouteHandlerClient
3. **Duplicate `async` keyword**: Many routes have `async async` in cookie handlers
4. **`Promise<ReadonlyRequestCookies>` errors**: Issues with the Next.js 15 cookies() function returning a Promise
5. **Database constant access**: Issues with accessing TABLES and FIELDS constants that are missing TypeScript definitions

## Next.js 15 Route Handlers Pattern

### Step 1: Fix Route Parameter Types

Next.js 15 route handlers should use the correct parameter type pattern:

```typescript
// INCORRECT - treats params as Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  const { tripId } = await params;
  // ...
}

// CORRECT - params is a direct object
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = params;
  // ...
}
```

### Step 2: Fix Supabase Client Initialization

```typescript
// INCORRECT - awaiting a non-async function
const supabase = await createRouteHandlerClient();

// CORRECT - direct assignment
const supabase = createRouteHandlerClient();
```

If you need TypeScript type assertions:

```typescript
import { createRouteHandlerClient, TypedSupabaseClient } from '@/utils/supabase/server';

const supabase = createRouteHandlerClient() as TypedSupabaseClient;
```

## Solution Pattern for Cookie Handling

### Step 1: Update Imports

Replace:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
```

With:

```typescript
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
```

### Step 2: Replace Supabase Client Creation

Replace:

```typescript
const cookieStore = await cookies();
const supabase = createServerClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          await cookieStore.set({ name, value, ...options });
        } catch (e) {
          /* ignore */
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          await cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        } catch (e) {
          /* ignore */
        }
      },
    },
  }
);
```

With:

```typescript
const supabase = createRouteHandlerClient();
```

### Step 3: Explicit Type Casting for Database Results

If you see errors like:

```
Type '{ error: true; } & String' is missing the following properties from type 'Trip': ...
```

Define proper interfaces for your data types and use explicit type casting:

```typescript
interface YourDataType {
  id: string;
  // other properties...
  [key: string]: any; // For additional properties
}

// When handling query results:
const { data: results } = await supabase.from(TABLES.YOUR_TABLE).select('*');

// Type cast the results
const typedResults = (results as YourDataType[]).map((item) => {
  // Process data...
  return {
    ...item,
    // Additional properties
  };
});
```

## Full Example of a Fixed API Route

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';
import { createRouteHandlerClient, TypedSupabaseClient } from '@/utils/supabase/server';

// Define your data types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  // other properties...
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    // Get params directly, no await needed
    const { userId } = params;

    // Create client without awaiting
    const supabase = createRouteHandlerClient();

    // Make queries
    const { data: profile, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process with proper type casting
    const typedProfile = profile as UserProfile;

    return NextResponse.json({ data: typedProfile });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Service Functions Pattern

If you're using service functions with EmailService or similar:

```typescript
// INCORRECT - Using methods that don't exist
await EmailService.sendPasswordResetEmail({
  to: email,
  resetUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  expiresInHours: 24,
});

// CORRECT - Using properly defined methods
await EmailService.sendEmail({
  to: email,
  subject: 'Reset your password',
  html: `
    <h1>Reset your password</h1>
    <p>Click the link below to reset your password:</p>
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password">Reset Password</a></p>
    <p>This link will expire in 24 hours.</p>
  `,
});
```

## Helpful Utilities

We've created utility functions in `utils/supabase/server.ts` that provide:

1. `createRouteHandlerClient()` - Creates a Supabase client for API routes
2. `createServerComponentClient()` - Creates a Supabase client for server components
3. `getServerSession()` - Gets the user session in server components

Use these utilities for proper type checking and consistency.

## Additional Tips

1. **Database constants**: Make sure you're importing from `@/utils/constants/database` and using constants like `TABLES.TRIPS` correctly
2. **TypeScript interfaces**: Define proper interfaces for your data types to avoid type errors
3. **Type casting**: Use explicit type casting when working with database results
4. **Error handling**: Always include proper error handling in your API routes
5. **Don't await `params`**: Remember that route parameters are not Promises in Next.js 15 anymore

By following these patterns, you should be able to fix the TypeScript errors in your API routes.
