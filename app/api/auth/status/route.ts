import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@sentry/nextjs';
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    // Create Supabase client to check status
    const supabase = await createApiRouteClient();

    // Get session data
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Get current user information if session exists
    let userData = null;
    let userError = null;
    let profileData = null;
    let profileError = null;

    if (session) {
      // Retrieve user data
      const userResponse = await supabase.auth.getUser();
      userData = userResponse.data.user;
      userError = userResponse.error;

      if (userData) {
        // Try to fetch profile data
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();

        profileData = profile;
        profileError = pError;
      }
    }

    // Get cookie information (without exposing sensitive data)
    const cookieInfo = {
      has_auth_cookies:
        request.cookies.has('sb-access-token') ||
        request.cookies.has('sb-refresh-token') ||
        request.cookies.has('supabase-auth-token'),
    };

    // Prepare diagnostic response
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      auth_state: {
        has_session: !!session,
        session_expires_at:
          session && session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        has_user: !!userData,
        has_profile: !!profileData,
      },
      errors: {
        session_error: error ? error.message : null,
        user_error: userError ? userError.message : null,
        profile_error: profileError ? profileError.message : null,
      },
      cookies: cookieInfo,
    };

    // Return diagnostic information
    return NextResponse.json(
      {
        status: 'success',
        authenticated: !!session,
        user: userData
          ? {
              id: userData.id,
              email: userData.email,
              email_confirmed: !!userData.email_confirmed_at,
              last_sign_in: userData.last_sign_in_at,
            }
          : null,
        profile: profileData
          ? {
              id: profileData.id,
              name: profileData.name,
              avatar_url: profileData.avatar_url,
              is_admin: profileData.is_admin,
            }
          : null,
        diagnostic: diagnosticInfo,
      },
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error('Auth status diagnostic error:', error);
    captureException(error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'An error occurred while checking authentication status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
}
