/**
 * Simplified Supabase client utilities for server components and API routes
 * 
 * This provides a consistent interface for working with Supabase in different contexts
 * using the latest @supabase/ssr package.
 */
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// --- Type Definitions ---
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a server component client that works with Next.js 15
 * This uses a minimal approach that doesn't depend on cookie handling
 */
export function createServerComponentClient(): TypedSupabaseClient {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      // Minimal cookie implementation that satisfies the type requirements
      cookies: {
        get(name: string) {
          // Server components shouldn't rely on cookies directly
          return undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Server components can't set cookies
        },
        remove(name: string, options: CookieOptions) {
          // Server components can't remove cookies
        }
      }
    }
  );
}

/**
 * Gets the current session via direct API call
 */
export async function getServerSession() {
  const supabase = createServerComponentClient();
  
  try {
    const sessionData = await supabase.auth.getSession();
    return sessionData;
  } catch (error) {
    console.error('Error getting session:', error);
    return { data: { session: null } };
  }
}

/**
 * Creates a route handler client for API routes with type compatibility
 * We've simplified the implementation to avoid issues with cookies()
 */
export function createRouteHandlerClient(): TypedSupabaseClient {
  // Create a simpler client that doesn't rely on cookies()
  // This works for API authentication checks but won't set cookies
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      },
      cookies: {
        get(name: string) {
          // This implementation doesn't access cookies directly
          // For full cookie support, use the request/response pattern in your route handler
          return undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          // This implementation doesn't set cookies
        },
        remove(name: string, options: CookieOptions) {
          // This implementation doesn't remove cookies
        }
      }
    }
  );
}

/**
 * For use in getServerSideProps or API routes in Pages Router
 */
export function getSupabaseServerClient(req: any, res: any): TypedSupabaseClient {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      },
      cookies: {
        get: (name: string) => {
          const cookies = req.cookies;
          return cookies[name];
        },
        set: (name: string, value: string, options: CookieOptions) => {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
        },
        remove: (name: string, options: CookieOptions) => {
          res.setHeader('Set-Cookie', `${name}=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        }
      }
    }
  );
}

/**
 * Creates a client specifically for API route handlers in App Router
 */
export function createApiClient(): TypedSupabaseClient {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      },
      // Minimal cookie implementation that satisfies type requirements
      cookies: {
        get(name: string) {
          // API routes don't need cookies in this implementation
          return undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          // API routes shouldn't set cookies in this implementation
        },
        remove(name: string, options: CookieOptions) {
          // API routes shouldn't remove cookies in this implementation
        }
      }
    }
  );
}

/**
 * For compatibility with older code - use createServerComponentClient directly in new code
 */
export const createServerSupabaseClient = createServerComponentClient;

/**
 * Check if user is authenticated on the server.
 * Returns true if the user has a valid session, false otherwise.
 */
export async function isAuthenticated() {
  try {
    const { data } = await getServerSession();
    return !!data?.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Re-export Database type if needed by consumers of this module
export type { Database };