/**
 * Supabase Server Utilities
 *
 * This module provides a consistent interface for working with Supabase in server contexts
 * using the @supabase/ssr package. It includes typed clients for server components, API routes,
 * and route handlers.
 *
 * Usage examples:
 *   - Server Component: const supabase = await createServerComponentClient();
 *   - API Route: const supabase = await createRouteHandlerClient();
 *   - API with Req/Res: const supabase = await createApiClientWithReqRes(req, res);
 */

import { createServerClient } from '@supabase/ssr';
import type { Database } from '../../types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================================
// CONFIGURATION & TYPE DEFINITIONS
// ============================================================================

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Type definitions
export type TypedSupabaseClient = SupabaseClient<Database>;
export type { Database };

type TableName = keyof Database['public']['Tables'] | keyof Database['public']['Views'];

// Default auth configuration for client creation
const DEFAULT_AUTH_CONFIG = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  flowType: 'pkce',
} as const;

// Fallback cookie handlers for static rendering contexts
const FALLBACK_COOKIE_HANDLERS = {
  get: () => undefined,
  set: () => {},
  remove: () => {},
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse cookie string from Cookie header
 */
function parseCookieString(cookieHeader: string): Record<string, string> {
  const cookieMap: Record<string, string> = {};

  if (!cookieHeader) return cookieMap;

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name) {
      const cookieName = name.trim();
      const cookieValue = rest.join('=');
      cookieMap[cookieName] = decodeURIComponent(cookieValue);
    }
  });

  return cookieMap;
}

/**
 * Converts Supabase cookie options to Next.js cookie options
 */
function convertCookieOptions(name: string, value: string, options: CookieOptions) {
  return {
    name,
    value,
    maxAge: options.maxAge,
    domain: options.domain,
    path: options.path,
    secure: options.secure,
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
  };
}

// ============================================================================
// CLIENT CREATION FUNCTIONS
// ============================================================================

/**
 * Creates a server component client that works with Next.js app router
 * For use in Server Components and Page/Layout components
 */
export async function createServerComponentClient(): Promise<TypedSupabaseClient> {
  try {
    // Import cookies only inside the function
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.warn(`Error reading cookie ${name}:`, error);
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieOptions = convertCookieOptions(name, value, options);
            cookieStore.set(cookieOptions);
          } catch (error) {
            // Just log but don't throw - this happens during static rendering
            console.warn('Cannot set cookie in this context');
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieOptions = convertCookieOptions(name, '', {
              ...options,
              maxAge: 0,
            });
            cookieStore.set(cookieOptions);
          } catch (error) {
            // Just log but don't throw - this happens during static rendering
            console.warn('Cannot delete cookie in this context');
          }
        },
      },
      auth: DEFAULT_AUTH_CONFIG,
    });
  } catch (error) {
    console.error('Error creating server component client:', error);

    // Create a client with no cookie handling (minimal fallback)
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: FALLBACK_COOKIE_HANDLERS,
      auth: {
        ...DEFAULT_AUTH_CONFIG,
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}

/**
 * Creates a Supabase client for use in route handlers
 *
 * @returns A configured Supabase client for server-side API routes
 */
export async function createRouteHandlerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookies = await cookieStore;
          return cookies.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookies = await cookieStore;
            cookies.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors
            console.error('Error setting cookie:', error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookies = await cookieStore;
            cookies.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

/**
 * Creates a client specifically for API route handlers with request/response
 * For use in API handlers that have direct access to req/res objects
 */
export async function createApiClientWithReqRes(
  req: NextRequest,
  res: NextResponse
): Promise<TypedSupabaseClient> {
  // Extract cookies from the request
  const cookieHeader = req.headers.get('cookie') || '';
  const cookieMap = parseCookieString(cookieHeader);

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieMap[name];
      },
      set(name: string, value: string, options: CookieOptions) {
        // For setting cookies, we modify the response
        try {
          res.cookies.set({
            name,
            value,
            maxAge: options.maxAge,
            domain: options.domain,
            path: options.path,
            secure: options.secure,
            httpOnly: options.httpOnly,
            sameSite: options.sameSite,
          });
        } catch (error) {
          console.warn(`Failed to set cookie ${name}:`, error);
        }
      },
      remove(name: string, options: CookieOptions) {
        // For removing cookies, set with expired date
        try {
          res.cookies.set({
            name,
            value: '',
            maxAge: 0,
            domain: options.domain,
            path: options.path,
            secure: options.secure,
            httpOnly: options.httpOnly,
            sameSite: options.sameSite,
          });
        } catch (error) {
          console.warn(`Failed to remove cookie ${name}:`, error);
        }
      },
    },
    auth: DEFAULT_AUTH_CONFIG,
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the current session via direct API call
 * Returns user information if authenticated
 */
export async function getServerSession() {
  const supabase = await createServerComponentClient();

  try {
    // Get the user securely through getUser instead of getSession
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user:', error);
      return { data: { user: null }, error };
    }

    // Return the user object instead of the session
    return { data: { user }, error: null };
  } catch (error) {
    console.error('Error getting session/user:', error);

    // Ensure the return type matches the expected structure even on catch
    return {
      data: { user: null },
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Check if user is authenticated on the server.
 * Returns true if the user has a valid session, false otherwise.
 */
export async function isAuthenticated() {
  try {
    const { data } = await getServerSession();
    return !!data?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Type-safe database client for server/API usage
 * Provides typed interfaces for database operations
 */
export async function getTypedDbClient() {
  const supabase = await createRouteHandlerClient();
  return {
    from<T extends TableName>(table: T) {
      // Type-safe from() method for tables/views
      // Use a type assertion to ensure the table argument is a valid key of the supabase.from overload
      return (supabase.from as any)(table);
    },
    // Add rpc method to the client
    rpc(functionName: string, params?: Record<string, any>) {
      return supabase.rpc(functionName, params);
    },
  };
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * For compatibility with older code - use createServerComponentClient directly in new code
 * @deprecated Use createServerComponentClient instead
 */
/**
 * @deprecated Use createServerComponentClient instead.
 * This alias is provided only for backward compatibility with legacy code.
 * Prefer importing and using createServerComponentClient directly in all new code.
 */
export const createServerSupabaseClient = createServerComponentClient;
