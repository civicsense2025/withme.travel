/**
 * Browser-only Supabase client utilities
 *
 * This file is safe to import in client components as it doesn't use server-only
 * features like next/headers.
 */
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Type for the Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

// Cached client to avoid creating multiple instances
let browserClient: TypedSupabaseClient | null = null;

/**
 * Gets the Supabase client for browser environments
 * @returns A typed Supabase client for browser use
 */
export function getBrowserClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be called in browser environments');
  }

  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anon key is missing');
  }

  // Create client with headers
  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Accept: 'application/json',
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return browserClient;
}

/**
 * Resets the browser client singleton (useful for testing or logout).
 */
export function resetBrowserClient(): void {
  console.log('[supabase] Resetting browser client singleton');
  browserClient = null;
}
