import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

// Create a cached client instance to avoid creating a new one on every call
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates a Supabase client for browser environments using @supabase/ssr.
 * Returns a cached instance if available to improve performance.
 *
 * @returns A typed Supabase client for browser use
 */
export function createClient() {
  // Only create a new client if we're in the browser and don't have one yet
  if (typeof window !== 'undefined' && !clientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    clientInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return clientInstance;
}

/**
 * Reset the client instance, forcing a new one to be created on next call.
 * Use this when you need a fresh client, such as after logout.
 */
export function resetClient() {
  clientInstance = null;
}

/**
 * Attempts to repair auth state when client and server are out of sync.
 * Simplified for better performance.
 *
 * @returns {Promise<boolean>} True if repair succeeded, false otherwise
 */
export async function repairAuthState(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const client = createClient();
  if (!client) {
    return false;
  }

  try {
    // Try to refresh the session
    const { data, error } = await client.auth.refreshSession();

    if (error || !data.session) {
      resetClient();
      return false;
    }

    return true;
  } catch (e) {
    resetClient();
    return false;
  }
}

/**
 * Export type for convenience
 */
export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;

/**
 * Alias for resetClient for backward compatibility
 */
export const resetAuthState = resetClient;
