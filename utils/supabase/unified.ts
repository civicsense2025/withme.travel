/**
 * Unified Supabase utilities for both App Router and Pages Router
 * 
 * This file provides a consistent interface for authentication that works in both
 * the app/ directory (Server Components) and pages/ directory (Client Components)
 */
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// --- Type Definitions ---
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client for use in browser environments
 */
export function getBrowserClient(): TypedSupabaseClient {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Dynamic import for the getServerComponentClient function
 * This approach prevents next/headers from being imported in client bundles
 */
export async function getServerComponentClient(): Promise<TypedSupabaseClient> {
  try {
    // Dynamic import to prevent next/headers from being included in client bundles
    const { getServerComponentClient: getClient } = await import('./server-component');
    return getClient();
    } catch (error) {
      console.error('Error importing server component client:', error);
    throw new Error('Failed to create server component client');
  }
}

/**
 * Get the user's session
 */
export async function getServerSession() {
  try {
    const { getServerComponentSession } = await import('./server-component');
    return await getServerComponentSession();
    } catch (error) {
      console.error('Error getting server session:', error);
    return { data: { session: null } };
  }
}

/**
 * Creates a Pages Router client for getServerSideProps
 */
export function getPagesServerClient(req: any, res: any): TypedSupabaseClient {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
  },
    cookies: {
      get(name: string) {
        const cookies = req.cookies;
        return cookies[name];
      },
      set(name: string, value: string, options: CookieOptions) {
        res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
      },
      remove(name: string, options: CookieOptions) {
        res.setHeader(
          'Set-Cookie',
          `${name}=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
        );
      },
    },
  });
}

/**
 * Creates a safe server client for middleware
 */
export function getMiddlewareClient(req: Request): TypedSupabaseClient {
  const requestHeaders = new Headers(req.headers);
  const cookieString = requestHeaders.get('cookie') || '';
  
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const match = cookieString.match(new RegExp(`${name}=([^;]+)`));
        return match ? match[1] : undefined;
      },
      // These functions are handled in the middleware directly
      set: () => {},
      remove: () => {},
    },
  });
}

export type { Database };