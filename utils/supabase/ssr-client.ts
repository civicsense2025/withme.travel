import { createServerSupabaseClient as createUnifiedServerClient } from './server'; // Import the unified client creator

// This file now acts as a wrapper/alias layer if needed,
// ensuring all server-side clients use the same core logic from server.ts

/**
 * @deprecated Use createServerSupabaseClient from '@/utils/supabase/server' directly.
 * Creates a Supabase client for Server Components using the unified server helper.
 */
export function createServerComponentClient() {
  console.warn("createServerComponentClient from ssr-client.ts is deprecated. Use createServerSupabaseClient from server.ts instead.");
  return createUnifiedServerClient();
}

/**
 * @deprecated Use createServerSupabaseClient from '@/utils/supabase/server' directly.
 * Creates a Supabase client for API Route Handlers using the unified server helper.
 */
export function createApiRouteClient() {
  console.warn("createApiRouteClient from ssr-client.ts is deprecated. Use createServerSupabaseClient from server.ts instead.");
  return createUnifiedServerClient();
} 