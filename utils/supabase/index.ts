/**
 * Centralized Supabase client utilities for Next.js
 *
 * This file provides type-safe Supabase client creation for both client and server components
 * with proper cookie handling throughout your Next.js application.
 */
import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import { createApiClient } from './api';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Keep a singleton for the browser client
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates a Supabase client configured for browser use.
 * In browser environments, we want a singleton client to avoid cookie conflicts.
 */
export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

/**
 * Creates a Supabase client configured for server use.
 * Properly handles cookie reading/writing for server components.
 */
export function createServerSupabaseClient() {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: async (name) => {
        try {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        } catch (error) {
          console.error(`[Cookie Get Error] Failed to get cookie ${name}:`, error);
          return undefined;
        }
      },
      set: async (name, value, options) => {
        try {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.error(`[Cookie Set Error] Failed to set cookie ${name}:`, error);
        }
      },
      remove: async (name, options) => {
        try {
          const cookieStore = await cookies();
          cookieStore.delete({ name, ...options });
        } catch (error) {
          console.error(`[Cookie Remove Error] Failed to remove cookie ${name}:`, error);
        }
      },
    },
  });
}

// Export the API client to make imports consistent
export { createApiClient };
