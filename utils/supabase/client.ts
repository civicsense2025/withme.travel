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
  if (typeof window === 'undefined') {
    throw new Error('createClient should only be used in client components.');
  }
  
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
export function resetBrowserClient() {
  clientSingleton = null;
}

// Also provide a reset function with the old name for compatibility
export const resetClient = resetBrowserClient;

export default createClient;

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
      resetBrowserClient();
      return false;
    }

    return true;
  } catch (e) {
    resetBrowserClient();
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
