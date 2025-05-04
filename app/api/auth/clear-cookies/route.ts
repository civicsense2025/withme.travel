import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
// This endpoint clears all authentication cookies and local storage, to help resolve issues with corrupted auth data
// Changed from GET to POST for better security (state-changing operations should use POST)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[API] Clearing authentication cookies');
    
    // List of common auth-related cookies that might need clearing
    const authCookies = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      '__session',
      'withme.auth.token'
    ];
    
    // Create a Supabase client that will automatically set the correct cookies when signing out
    const supabase = await createRouteHandlerClient();
    
    // Sign out to ensure all auth state is cleared
    await supabase.auth.signOut();
    
    // Create response with cleared cookies
    const response = NextResponse.json(
      { success: true, message: 'Authentication cookies cleared successfully' },
      { status: 200 }
    );
    
    // Explicitly set all cookies to expired in the response
    for (const cookieName of authCookies) {
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    
    return response;
  } catch (error) {
    console.error('[API] Error clearing cookies:', error);
    
    // Return error response
    return NextResponse.json(
      { success: false, message: 'Failed to clear authentication cookies' },
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
