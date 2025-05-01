/**
 * Centralized Supabase client utilities for Next.js
 *
 * This file provides type-safe Supabase client creation for both client and server components
 * with proper cookie handling throughout your Next.js application.
 */
import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { type RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import type { Database } from '@/types/database.types';

// Type definitions for error handling
interface CookieError extends Error {
  code?: string;
  cause?: unknown;
}

// Common configuration for Supabase clients
export const supabaseConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// Throw error if env variables are missing
if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Type definitions for Supabase clients
export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;
export type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

// Cache for browser client to avoid multiple instances
let browserClientCache: SupabaseBrowserClient | null = null;

/**
 * Create a browser client for client components
 * Uses caching to avoid creating multiple instances
 */
export function createClient(): SupabaseBrowserClient {
  if (typeof window === 'undefined') {
    throw new Error(
      'createClient is only available in the browser. For server components, use createServerComponentClient.'
    );
  }

  if (browserClientCache) {
    return browserClientCache;
  }

  browserClientCache = createBrowserClient<Database>(
    supabaseConfig.supabaseUrl!,
    supabaseConfig.supabaseAnonKey!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-client-info': `nextjs-supabase-client/${process.env.npm_package_version || 'unknown'}`,
        },
      },
    }
  );

  return browserClientCache;
}

/**
 * Reset the browser client cache
 * Useful for logout or when auth state changes
 */
export function resetClient(): void {
  browserClientCache = null;
}

/**
 * Create a server client for server components
 * @param cookieStore A Next.js cookie store from the cookies() function
 */
export function createServerComponentClient(
  cookieStore: ReturnType<typeof cookies>
): SupabaseServerClient {
  return createServerClient<Database>(
    supabaseConfig.supabaseUrl!,
    supabaseConfig.supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (error) {
            const cookieError = error as CookieError;
            // Handle cases where cookies() was called after headers were sent
            if (cookieError.message?.includes('cookies() is not available')) {
              console.error('Cookie store not available in this context:', cookieError);
            } else {
              console.error('Error getting cookie in server component:', cookieError);
            }
            return undefined;
          }
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            // Handle cookie operations asynchronously
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            const cookieError = error as CookieError;
            // Handle edge cases for headers already sent or response already finished
            if (
              cookieError.message?.includes('headers already sent') ||
              cookieError.message?.includes('Response already finished')
            ) {
              console.error('Cannot set cookie - response is already finalized:', cookieError);
            } else {
              console.error('Error setting cookie in server component:', cookieError);
            }
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            // Handle cookie operations asynchronously
            cookieStore.delete({ name, ...options });
          } catch (error) {
            const cookieError = error as CookieError;
            // Handle edge cases for headers already sent or response already finished
            if (
              cookieError.message?.includes('headers already sent') ||
              cookieError.message?.includes('Response already finished')
            ) {
              console.error('Cannot remove cookie - response is already finalized:', cookieError);
            } else {
              console.error('Error removing cookie in server component:', cookieError);
            }
          }
        },
      },
    }
  );
}

/**
 * Create a server client for API route handlers
 * @param cookieStore A Next.js cookie store (e.g., from cookies() in route handlers)
 */
export function createRouteHandlerClient(
  cookieStore: ReturnType<typeof cookies>
): SupabaseServerClient {
  return createServerComponentClient(cookieStore);
}

/**
 * Create a server client for middleware
 * Handles both sync and async cookie methods for middleware compatibility
 */
/**
 * Type definition for middleware cookie stores
 */
interface MiddlewareCookieStore {
  cookies: {
    get: (name: string) => { name: string; value: string } | undefined;
  };
  response?: {
    cookies: {
      set: (cookie: { name: string; value: string } & CookieOptions) => void;
      delete: (cookie: { name: string } & Pick<CookieOptions, 'domain' | 'path'>) => void;
    };
  };
}

/**
 * Create a server client for middleware
 * Handles both sync and async cookie methods for middleware compatibility
 * @param request The middleware request object with cookie methods
 */
export function createMiddlewareClient(request: MiddlewareCookieStore): SupabaseServerClient {
  return createServerClient<Database>(
    supabaseConfig.supabaseUrl!,
    supabaseConfig.supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          try {
            return request.cookies.get(name)?.value;
          } catch (error) {
            console.error('Error getting cookie in middleware:', error);
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            if (request.response) {
              request.response.cookies.set({
                name,
                value,
                ...options,
              });
            }
          } catch (error) {
            console.error('Error setting cookie in middleware:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            if (request.response) {
              request.response.cookies.delete({
                name,
                domain: options.domain,
                path: options.path,
              });
            }
          } catch (error) {
            console.error('Error removing cookie in middleware:', error);
          }
        },
      },
    }
  );
}

/**
 * Utility to repair Supabase auth state inconsistencies
 */
export async function repairAuthState(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const client = createClient();
    const { data, error } = await client.auth.refreshSession();

    if (error || !data.session) {
      // Handle common error scenarios
      if (error?.message?.includes('refresh_token')) {
        console.error('Invalid refresh token detected. Clearing auth state.', error);
      } else if (error?.message?.includes('jwt expired')) {
        console.error('JWT has expired. Clearing auth state.', error);
      } else if (error) {
        console.error('Session refresh failed:', error);
      }

      resetClient();
      return false;
    }

    return true;
  } catch (e) {
    console.error('Unexpected error during auth state repair:', e);
    resetClient();
    return false;
  }
}

/**
 * Get current server session - convenience method for server components
 */
export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient(cookieStore);
    return await supabase.auth.getSession();
  } catch (error) {
    const typedError = error as CookieError;
    // Provide more detailed error information based on error type
    if (typedError.message?.includes('cookies() is not available')) {
      console.error(
        'Cookie store not available in this context. Make sure this function is called in a Server Component or Route Handler.',
        typedError
      );
    } else if (typedError.message?.includes('could not refresh session')) {
      console.error(
        'Session refresh failed. This might be due to an invalid or expired refresh token.',
        typedError
      );
    } else {
      console.error('Error getting server session:', typedError);
    }

    // Always return a valid response structure even on error
    return { data: { session: null } };
  }
}

/**
 * Get current server user - convenience method for server components
 */
export async function getServerUser() {
  const { data } = await getServerSession();
  return data.session?.user || null;
}

/**
 * Check if user is authenticated on the server
 */
export async function isAuthenticated() {
  const { data } = await getServerSession();
  return !!data.session;
}

// Legacy aliases for backward compatibility
export const createApiClient = createRouteHandlerClient;
export const createSupabaseServerClient = createServerComponentClient;
export const resetAuthState = resetClient;

// Re-export for convenience
export type { Database };
