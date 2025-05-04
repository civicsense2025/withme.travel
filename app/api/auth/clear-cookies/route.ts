import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@/utils/supabase/server';
// This endpoint clears all authentication cookies and local storage, to help resolve issues with corrupted auth data
// Changed from GET to POST for better security (state-changing operations should use POST)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();

    // Try to sign out from Supabase first (if there's an active session)
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('API Clear Cookies: Successfully signed out active session');
    } catch (signOutError) {
      console.warn('API Clear Cookies: Could not sign out active session', signOutError);
      // Continue with cookie clearing even if sign out fails
    }

    // Clear all Supabase auth-related cookies (expanded list)
    const cookiesToClear = [
      // Original cookies
      'supabase-auth-token',
      'sb-refresh-token',
      'sb-access-token',
      '__supabase_session_id',

      // Additional cookies used by newer versions
      '__supabase_auth_token',
      'supabase-auth-refresh-token',
      'sb-provider-token',
      'sb-callback',

      // App-specific cookies that might store auth state
      'auth_redirect',
      'auth_state',
      'user_session',
      'auth_state',
      'user_session',
      'is_authenticated',
    ];

    // Create response for cookie clearing
    const response = NextResponse.json(
      {
        success: true,
        message: "You're now logged out. Your session has been cleared.",
        details: {
          cookies_cleared: cookiesToClear,
        },
      },
      { status: 200 }
    );

    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Set expired cookies to clear them
    cookiesToClear.forEach((cookieName) => {
      console.log(`API Clear Cookies: Clearing cookie: ${cookieName}`);
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });
    });

    console.log(`API Clear Cookies: Cleared ${cookiesToClear.length} cookies`);

    return response;
  } catch (error) {
    console.error('Error clearing auth cookies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear authentication cookies',
      },
      { status: 500 }
    );
  }
}

/**
 * Comprehensive auth cookie clearing endpoint
 * This endpoint completely clears all auth cookies and actively signs out
 * the user from both client and server sessions
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[Auth] Clearing auth cookies...');

    // Create a response for cookie clearing
    const response = NextResponse.json({
      success: true,
      message: 'Auth cookies cleared',
    });

    // Get Supabase project reference from environment variable
    const supabaseReference =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/([a-z0-9]+)\.supabase\.co/)?.[1];

    if (!supabaseReference) {
      console.error('[Auth] Could not determine Supabase reference from URL');
      return NextResponse.json(
        { success: false, message: 'Failed to determine Supabase reference' },
        { status: 500 }
      );
    }

    // 1. Clear both parts of the token cookie (Supabase uses two cookies for the token)
    const cookiesToClear = [
      `sb-${supabaseReference}-auth-token.0`,
      `sb-${supabaseReference}-auth-token.1`,
      // Also clear any potential legacy or additional auth cookies
      'supabase-auth-token',
      'sb-refresh-token',
      'sb-access-token',
      '__supabase_session_id',
    ];

    // Set expired cookies to clear them in the response
    cookiesToClear.forEach((cookieName) => {
      console.log(`[Auth] Clearing cookie: ${cookieName}`);
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });
    });

    // 2. Also try to sign out via API client to clear server-side session
    try {
      const supabase = await createRouteHandlerClient();
      await supabase.auth.signOut({ scope: 'global' });
      console.log('[Auth] Signed out via Supabase API');
    } catch (error) {
      console.error('[Auth] Error signing out via API:', error);
      // Still continue with cookie clearing even if this fails
    }

    // 3. Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log('[Auth] Auth cookies cleared successfully');
    return response;
  } catch (error) {
    console.error('[Auth] Error clearing cookies:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to clear cookies',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
