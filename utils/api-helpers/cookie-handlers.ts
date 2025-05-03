/**
 * Cookie handling utilities for API routes in Next.js 15
 * 
 * This provides a consistent pattern for handling cookies in API routes
 * with the Promise-based cookies() API introduced in Next.js 15.
 */
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates cookie handlers for use with Supabase clients in API routes
 * Properly handles the Promise-based cookies() API in Next.js 15
 */
export async function createApiCookieHandlers() {
  const cookieStore = await cookies();
  
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value, ...options });
      } catch (e) {
        // Cannot set cookies in some contexts
        console.warn('Failed to set cookie:', e);
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      } catch (e) {
        // Cannot remove cookies in some contexts
        console.warn('Failed to remove cookie:', e);
      }
    }
  };
}

/**
 * Creates a Supabase client for use in API routes
 * Handles cookies properly with the Promise-based cookies() API in Next.js 15
 */
export async function createApiRouteClient() {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: await createApiCookieHandlers()
    }
  );
} 