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

// Singleton for the browser client
let browserSingletonClient: TypedSupabaseClient | null = null;

/**
 * Creates or retrieves a Supabase client for browser environments (singleton).
 * This function is safe to use in client components.
 */
export function getBrowserClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be called in browser environments.');
  }
  
  if (browserSingletonClient) {
    return browserSingletonClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables (URL or Anon Key).');
  }

  console.log('[supabase] Creating new browser client singleton');
  browserSingletonClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserSingletonClient;
}

/**
 * Resets the browser client singleton (useful for testing or logout).
 */
export function resetBrowserClient(): void {
  console.log('[supabase] Resetting browser client singleton');
  browserSingletonClient = null;
} 