/**
 * Client-side Supabase utilities
 * This file is safe to import from client components
 
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (URL or Anon Key).');
}

// Create a singleton instance
let clientSingleton: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * Creates a Supabase client for use in browser environments
 */
export function createClient() {
  if (clientSingleton) {
    return clientSingleton;
  }
  
  // Use non-null assertions since we've already checked the values
  clientSingleton = createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!);
  return clientSingleton;
}

/**
 * Creates a browser client (alias for createClient)
 
 */

export const createBrowserClient = createClient;

/**
 * Resets the client singleton (useful for testing or logout)
 */
export async function resetBrowserClient() {
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
      clientSingleton = null;
      return false;
    }

    return true;
  } catch (e) {
    clientSingleton = null;
    return false;
  }
}

/**
 * Export type for convenience
 
 */

export type SupabaseBrowserClient = ReturnType<typeof createSupabaseClient<Database>>;

/**
 * Alias for resetBrowserClient for backward compatibility
 */
export const resetAuthState = resetBrowserClient;
