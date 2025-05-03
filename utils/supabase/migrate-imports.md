# Authentication Migration Guide

## Overview

We've updated our authentication system to be compatible with both App Router and Pages Router. This guide will help you migrate existing code to use the new unified approach.

## Key Changes

1. Removed direct dependency on `next/headers` in server-side utilities
2. Created safe client creation functions for all environments
3. Ensured consistent auth session handling across the application

## Migration Steps

### 1. Client Components (browser environment)

**Before:**
```tsx
import { getBrowserClient } from '@/utils/supabase/unified';
// or
import { createClient } from '@/utils/supabase/client';

const supabase = getBrowserClient();
// or
const supabase = createClient();
```

**After:**
```tsx
import { getBrowserClient } from '@/utils/supabase/unified';

const supabase = getBrowserClient();
```

### 2. Server Components (App Router)

**Before:**
```tsx
import { createServerComponentClient } from '@/utils/supabase/server';
// or
import { getServerComponentClient } from '@/utils/supabase/unified';

const supabase = createServerComponentClient();
```

**After:**
```tsx
import { createServerComponentClient } from '@/utils/supabase/unified';

const supabase = createServerComponentClient();
```

### 3. API Routes (App Router)

**Before:**
```tsx
import { createRouteHandlerClient } from '@/utils/supabase/server';

const supabase = createRouteHandlerClient();
```

**After:**
```tsx
import { createServerComponentClient } from '@/utils/supabase/unified';

// Use the same function for simplicity
const supabase = createServerComponentClient();
```

### 4. getServerSideProps (Pages Router)

**Before:**
```tsx
import { getSupabaseServerClient } from '@/utils/supabase/server';

export const getServerSideProps = async ({ req, res }) => {
  const supabase = getSupabaseServerClient(req, res);
  // ...
};
```

**After:**
```tsx
import { getPagesServerClient } from '@/utils/supabase/unified';

export const getServerSideProps = async ({ req, res }) => {
  const supabase = getPagesServerClient(req, res);
  // ...
};
```

### 5. Middleware

**Before:**
```tsx
import { createMiddlewareClient } from '@/utils/supabase/server';

const supabase = createMiddlewareClient(req);
```

**After:**
```tsx
import { getMiddlewareClient } from '@/utils/supabase/unified';

const supabase = getMiddlewareClient(req);
```

### 6. Getting Session Data

**Before:**
```tsx
import { getServerSession } from '@/utils/supabase/server';

const { data: { session } } = await getServerSession();
```

**After:**
```tsx
import { getServerSession } from '@/utils/supabase/unified';

const { data: { session } } = await getServerSession();
```

## Important Notes

1. When importing from the new unified module, ensure you're using the correct function for your context.
2. The auth provider is now compatible with both App Router and Pages Router.
3. Always handle authentication errors with proper fallbacks.
4. If you encounter build errors, check that you're not mixing server-only and client imports.

## Common Issues

### Error: You're importing a component that needs "next/headers"

This error occurs when server-only code is being imported in client components or Pages Router code. Use the appropriate client creation function from `unified.ts` for your context.

### AuthSessionMissingError

This can happen when cookie access is not properly set up. Ensure you're using the correct client creation function for your environment.

### Other Issues

If you encounter any other issues during migration, please refer to the authentication documentation or open an issue on our internal tracker. 