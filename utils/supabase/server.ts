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
              maxAge: 0
            });
            cookieStore.set(cookieOptions);
          } catch (error) {
            // Just log but don't throw - this happens during static rendering
            console.warn('Cannot delete cookie in this context');
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
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
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    });
  }
}

/**
 * Gets the current session via direct API call
 */
export async function getServerSession() {
  const supabase = await createServerComponentClient();

  try {
    // Get the user securely through getUser instead of getSession
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return { data: { user: null }, error };
    }
    // Return the user object instead of the session
    return { data: { user }, error: null };
  } catch (error) {
    console.error('Error getting session/user:', error);
    // Ensure the return type matches the expected structure even on catch
    return { data: { user: null }, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Creates a route handler client for API routes with type compatibility
 */
export async function createRouteHandlerClient(): Promise<TypedSupabaseClient> {
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
            // Just log but don't throw - invalid cookie operations should not crash the app
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
            // Just log but don't throw - invalid cookie operations should not crash the app
            console.warn('Cannot delete cookie in route handler context');
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
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
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
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
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
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
    return !!data?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Re-export Database type if needed by consumers of this module
export type { Database };
