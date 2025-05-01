# Supabase Client Migration Guide

## Problem

We've encountered issues with multiple Supabase client instances that cause cookie conflicts and authentication problems. The error appears as:

```
Multiple GoTrueClient instances detected in the same browser context
```

And related cookie parsing errors:

```
Failed to parse cookie string: SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON
```

## Solution

We need to standardize on a single Supabase client implementation:

### For client components:

```typescript
// OLD - Don't use:
import { supabase } from '@/lib/supabase/client';
// OR
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// NEW - Use this instead:
import { supabase } from '@/utils/supabase/client';
```

### For server API routes:

```typescript
// OLD - Don't use:
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
const supabase = createRouteHandlerClient({ cookies });

// NEW - Use this instead:
import { createClient } from '@/utils/supabase/server';
const supabase = createClient();
```

## Steps to migrate

1. For any `.tsx` file using Supabase client:

   - Replace `@/lib/supabase/client` with `@/utils/supabase/client`

2. For any API routes in `app/api/**/*.ts`:

   - Replace `createRouteHandlerClient` with our custom `createClient` function
   - Update the import path to `@/utils/supabase/server`
   - Remove the `{ cookies }` argument

3. For middleware:
   - Use the implementation in `@/utils/supabase/middleware`

## Testing

After migration, check the browser console to ensure there are no:

- "Multiple GoTrueClient instances" warnings
- Cookie parsing errors
- Authentication issues

## Benefits

- Single source of truth for Supabase client
- Robust cookie handling
- Better error recovery
- Consistent behavior across components and API routes
