/**
 * Supabase client utilities specifically for API routes and Route Handlers
 *
 * This file provides simplified, type-safe Supabase client creation
 * for API routes with proper cookie handling and error management.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';
import { captureException } from '@sentry/nextjs';

// Error type for cookie handling errors
interface CookieError extends Error {
  code?: string;
  cause?: unknown;
}

// Type definition for Supabase server client
export type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

/**
 * Creates a Supabase client configured for API routes.
 */
export function createApiClient() {
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

// Legacy alias for createApiClient
export const createRouteHandlerClient = createApiClient;

/**
 * Creates a Supabase client for API routes with proper cookie handling
 *
 * @param cookieStore Optional cookie store from next/headers cookies()
 * @returns A typed Supabase client for API routes
 */
export function createServerSupabaseClient(cookieStore?: ReturnType<typeof cookies>): SupabaseServerClient {
  try {
    // Use provided cookie store or create a new one
    const store = cookieStore || cookies();

    return createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            try {
              return store.get(name)?.value;
            } catch (error) {
              const cookieError = error as CookieError;
              // Log error but don't crash the request
              console.error('Error getting cookie in API route:', cookieError);
              return undefined;
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              store.set({ name, value, ...options });
            } catch (error) {
              const cookieError = error as CookieError;
              if (
                cookieError.message?.includes('headers already sent') ||
                cookieError.message?.includes('Response already finished')
              ) {
                console.error('Cannot set cookie - response is already finalized:', cookieError);
              } else {
                console.error('Error setting cookie in API route:', cookieError);
              }
              captureException(cookieError);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              store.delete({ name, ...options });
            } catch (error) {
              const cookieError = error as CookieError;
              if (
                cookieError.message?.includes('headers already sent') ||
                cookieError.message?.includes('Response already finished')
              ) {
                console.error('Cannot remove cookie - response is already finalized:', cookieError);
              } else {
                console.error('Error removing cookie in API route:', cookieError);
              }
              captureException(cookieError);
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('Error creating Supabase client for API route:', error);
    captureException(error);
    throw error;
  }
}

/**
 * Utility to get the current authenticated user in an API route
 *
 * @returns The authenticated user or null
 */
export async function getAuthUser() {
  try {
    const supabase = createServerSupabaseClient(cookies());
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting authenticated user:', error);
      captureException(error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Unexpected error getting authenticated user:', error);
    captureException(error);
    return null;
  }
}

/**
 * Check if a request is authenticated
 *
 * @returns Boolean indicating if the request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient(cookies());
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking authentication:', error);
      captureException(error);
      return false;
    }

    return !!data.session;
  } catch (error) {
    console.error('Unexpected error checking authentication:', error);
    captureException(error);
    return false;
  }
}

/**
 * Helper to handle unauthenticated requests with standard response
 *
 * @returns NextResponse with 401 status
 */
export function handleUnauthenticated(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized', message: 'Authentication required' },
    { status: 401 }
  );
}

/**
 * Combines authentication check with standard error handling
 * Use this as a guard at the beginning of API routes that require auth
 *
 * @returns NextResponse error if not authenticated, null if authenticated
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return handleUnauthenticated();
  }

  return null;
}
