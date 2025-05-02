/**
 * Unified Supabase Client Utilities using @supabase/ssr
 *
 * This file provides a standardized approach for creating Supabase clients
 * across Server Components, Client Components, Server Actions, Route Handlers,
 * and Middleware within a Next.js App Router application.
 */
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import {
  createBrowserClient as _createBrowserClient,
  createServerClient as _createServerClient,
  type CookieOptions,
  // SupabaseClient type is usually imported from the core package
} from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient type here
import type { Database } from '@/types/database.types';
import { NextRequest, NextResponse } from 'next/server'; // Changed NextResponse to regular import
import { captureException } from '@sentry/nextjs'; // Assuming Sentry setup

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (URL or Anon Key).');
}

// --- Type Definitions ---
// Use the imported SupabaseClient type
export type TypedSupabaseClient = SupabaseClient<Database>;

// --- Browser Client ---
let browserSingletonClient: TypedSupabaseClient | null = null;

/**
 * Creates/retrieves a Supabase client for browser environments (singleton).
 * IMPORTANT: This function is intended ONLY for CLIENT components.
 */
export function getBrowserClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be called in browser environments.');
  }
  if (browserSingletonClient) {
    return browserSingletonClient;
  }

  console.log('[supabase] Creating new browser client singleton');
  browserSingletonClient = _createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
  return browserSingletonClient;
}

/**
 * Resets the browser client singleton (useful for testing or logout).
 */
export function resetBrowserClient() {
  console.log('[supabase] Resetting browser client singleton');
  browserSingletonClient = null;
}

// --- Server Clients (using @supabase/ssr patterns) ---

/**
 * Creates a Supabase client for Server Components (read-only cookies).
 * No longer using unstable_cache as it causes conflicts with cookies()
 */
export async function getServerComponentClient(): Promise<TypedSupabaseClient> {
  console.log('[supabase] Creating server component client');
  try {
    // Get the cookies asynchronously - in Next.js 14+ we need to await this
    const cookieStore = await cookies();
    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.warn(`[supabase] Error accessing cookie ${name}:`, error);
            return undefined;
          }
        },
        // Server Components cannot set cookies
      },
    });
  } catch (error) {
    console.error('[supabase] Error creating server component client:', error);
    // Create a minimal client with no cookie access as fallback
    // This will still work for non-auth operations
    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          return undefined;
        },
      },
    });
  }
}

/**
 * Creates a Supabase client for Server Actions (mutable cookies).
 */
export async function getServerActionClient(): Promise<TypedSupabaseClient> {
  console.log('[supabase] Creating server action client');
  try {
    // Get cookies asynchronously
    const cookieStore = await cookies();
    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.warn(`[supabase] Error accessing cookie ${name} in Server Action:`, error);
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.error('[supabase] Failed to set cookie in Server Action:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            console.error('[supabase] Failed to remove cookie in Server Action:', error);
          }
        },
      },
    });
  } catch (error) {
    console.error('[supabase] Error creating server action client:', error);
    // Create a minimal client as fallback
    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    });
  }
}

/**
 * Creates a Supabase client for API Route Handlers (mutable cookies).
 * This function is used for API routes to access authentication data.
 */
export async function getRouteHandlerClient(req?: Request): Promise<TypedSupabaseClient> {
  console.log('[supabase] Creating route handler client');
  try {
    // Get cookies asynchronously
    const cookieStore = await cookies();

    // Debug logging
    console.log('[supabase] Route handler cookie store available:', !!cookieStore);

    // If a request is provided, we can also extract cookies from it as a fallback
    let cookieHeader = '';
    if (req) {
      cookieHeader = req.headers.get('cookie') || '';
      console.log('[supabase] Request cookie header present:', !!cookieHeader);
    }

    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          try {
            // First try the cookie store
            const cookie = cookieStore.get(name);
            if (cookie) {
              return cookie.value;
            }

            // Fallback to parsing from request header if available
            if (req && cookieHeader) {
              const cookies = cookieHeader.split(';');
              for (const c of cookies) {
                const [key, val] = c.trim().split('=');
                if (key === name) {
                  return decodeURIComponent(val);
                }
              }
            }

            return undefined;
          } catch (error) {
            console.warn(`[supabase] Error accessing cookie ${name} in Route Handler:`, error);
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.error('[supabase] Failed to set cookie in Route Handler:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            console.error('[supabase] Failed to remove cookie in Route Handler:', error);
          }
        },
      },
    });
  } catch (error) {
    console.error('[supabase] Error creating route handler client:', error);
    // Create a minimal client as fallback
    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    });
  }
}

/**
 * Creates a Supabase client for Middleware (reads/writes cookies on Request/Response).
 * Returns the client and the potentially modified response.
 * Uses a default NextResponse if none is provided.
 */
export function getMiddlewareClient(
  request: NextRequest,
  response = NextResponse.next() // Add default response
): { supabase: TypedSupabaseClient; response: NextResponse } {
  console.log('[supabase] Creating middleware client');

  const supabase = _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name, value, options) => {
        // Middleware uses ResponseCookies API on the provided/created response
        response.cookies.set({ name, value, ...options });
      },
      remove: (name, options) => {
        // Middleware uses ResponseCookies API on the provided/created response
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  return { supabase, response };
}

// --- Session & User Helpers ---

/**
 * Get current server session (uses Server Component client).
 * Returns the session object or null.
 */
export async function getServerSession() {
  try {
    const supabase = await getServerComponentClient();

    // Make sure we're using the right method to get the session
    if (!supabase.auth || typeof supabase.auth.getSession !== 'function') {
      console.error('[supabase] Invalid client - auth.getSession is not available');
      return null;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      // Log only unexpected errors
      if (
        error.message !== 'No session found' &&
        !error.message.includes('AuthSessionMissingError')
      ) {
        console.warn('[supabase] Error fetching server session:', error.message);
      }
      return null; // Return null on error
    }
    return session;
  } catch (error: any) {
    // Catch errors related to calling cookies() in wrong context
    if (
      error.message?.includes('Invariant: cookies()') ||
      error.message?.includes('static generation') ||
      error.message?.includes('Headers are read-only') ||
      error.message?.includes('cache scope is not supported')
    ) {
      console.error('[supabase] getServerSession called in invalid context:', error.message);
    } else {
      console.error('[supabase] Unexpected error getting server session:', error);
      captureException(error);
    }
    return null; // Return null on unexpected errors
  }
}

/**
 * Get current server user object.
 * Returns the user object or null.
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}

/**
 * Check if user is authenticated on the server.
 * Returns boolean.
 */
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session;
}

/**
 * Guard function for authenticated routes/actions.
 * Returns a NextResponse for redirection or error, or null if authenticated.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    // For API Routes or Server Actions, return a JSON response
    // For Server Components, you might want to redirect instead
    return NextResponse.json(
      // Using NextResponse as a value now
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  return null; // User is authenticated
}

// --- Re-exports ---
export type { Database };
