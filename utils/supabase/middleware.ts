/**
 * Middleware-specific Supabase utilities
 *
 * This file provides functions specifically for use in Next.js middleware.
 * IMPORTANT: Do NOT add 'use client' directive to this file.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
// Import from unified.ts which has the proper dependencies configured
import { getMiddlewareClient as createUnifiedMiddlewareClient } from '@/utils/supabase/unified';

/**
 * Creates a Supabase client for middleware - wrapper around unified client
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createUnifiedMiddlewareClient(request, response);
}

/**
 * Middleware function to refresh the Supabase session cookie.
 * Ensures server components and API routes have up-to-date auth state.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse: NextResponse | null = null;
  try {
    // Only log debugging information in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Attempting to update session...');
    }

    const supabase = await createSupabaseServerClient();

    // It's generally recommended to handle the response, although getUser often works implicitly
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // Don't treat auth session missing as an error - this is normal for unauthenticated users
      if (
        error.message !== 'Auth session missing!' &&
        !error.message?.includes('AuthSessionMissingError')
      ) {
        console.error('[Middleware] Error getting user in middleware:', error);
      }
      // Allow request to continue regardless of authentication status
    } else if (process.env.NODE_ENV === 'development' && data?.user) {
      console.log('[Middleware] Session updated for user:', data.user.id);
    }

    // If createServerClient modified the response (e.g., set cookies), use it
    // Note: This specific implementation might vary based on how your createClient handles cookies
    // For now, we assume NextResponse.next is sufficient unless createClient explicitly returns a modified response
    supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  } catch (e) {
    console.error('[Middleware] Caught exception during session update:', e);
    // If an error occurs, pass the request through without modifying cookies potentially
    supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Continue the request chain
  return supabaseResponse;
}

// No need to manage cookies explicitly here anymore.
// The `createClient` from `@/utils/supabase/server` handles cookie
// interactions automatically using the `cookies()` function from `next/headers`.
