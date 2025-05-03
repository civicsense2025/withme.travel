/**
 * Simplified Supabase client utilities for server components and API routes
 *
 * This provides a consistent interface for working with Supabase in different contexts
 * using the latest @supabase/ssr package.
 */
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../../types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
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

/**
 * Creates a server component client that works with Next.js app router
 */
export async function createServerComponentClient(): Promise<TypedSupabaseClient> {
  try {
    const cookieStore = await cookies();
    
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieOptions = convertCookieOptions(name, value, options);
            cookieStore.set(cookieOptions);
          } catch (error) {
            console.warn('Cannot set cookie in this context');
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieOptions = convertCookieOptions(name, '', {
              ...options,
              maxAge: 0
            });
            cookieStore.set(cookieOptions);
          } catch (error) {
            console.warn('Cannot delete cookie in this context');
          }
        },
      },
    });
  } catch (error) {
    console.error('Error creating server component client:', error);
    
    // Create a client with no cookie handling (minimal fallback)
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    });
  }
}

/**
 * Gets the current session via direct API call
 */
export async function getServerSession() {
  const supabase = await createServerComponentClient();

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
 */
export async function createRouteHandlerClient(): Promise<TypedSupabaseClient> {
  try {
    // Try to use Next.js cookies() API
    const cookieStore = await cookies();
    
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieOptions = convertCookieOptions(name, value, options);
            cookieStore.set(cookieOptions);
          } catch (error) {
            console.warn('Cannot set cookie in route handler context');
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieOptions = convertCookieOptions(name, '', {
              ...options,
              maxAge: 0
            });
            cookieStore.set(cookieOptions);
          } catch (error) {
            console.warn('Cannot delete cookie in route handler context');
          }
        },
      },
    });
  } catch (error) {
    console.warn('Falling back to basic client with no cookie handling:', error);
    
    // Create a client with no cookie handling (minimal fallback)
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    });
  }
}

/**
 * Creates a client specifically for API route handlers with request/response
 */
export async function createApiClientWithReqRes(req: NextRequest, res: NextResponse): Promise<TypedSupabaseClient> {
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
      },
      remove(name: string, options: CookieOptions) {
        // For removing cookies, set with expired date
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
      },
    },
  });
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
