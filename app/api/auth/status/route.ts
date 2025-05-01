import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/utils/supabase/api';
import { cookies } from 'next/headers';
import { captureException } from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client for checking auth status
    const supabase = createApiClient(cookies());

    // Get current session information
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    // Get current user information if session exists
    let userData = null;
    let userError = null;
    let profileData = null;
    let profileError = null;

    if (sessionData?.session) {
      const { data: user, error } = await supabase.auth.getUser();
      userData = user;
      userError = error;

      if (user?.user) {
        // Try to fetch profile data
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.user.id)
          .single();

        profileData = profile;
        profileError = pError;
      }
    }

    // Get cookie information (without exposing sensitive data)
    // In Next.js 15, cookies() returns a Promise, so we'll skip the detailed cookie listing
    const cookieInfo = {
      has_auth_cookies: request.cookies.has('sb-access-token') || 
                        request.cookies.has('sb-refresh-token') ||
                        request.cookies.has('supabase-auth-token')
    };

    // Prepare diagnostic response
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      auth_state: {
        has_session: !!sessionData?.session,
        session_expires_at: sessionData?.session?.expires_at
          ? new Date(sessionData.session.expires_at * 1000).toISOString()
          : null,
        has_user: !!userData?.user,
        has_profile: !!profileData,
      },
      errors: {
        session_error: sessionError ? sessionError.message : null,
        user_error: userError ? userError.message : null,
        profile_error: profileError ? profileError.message : null,
      },
      cookies: cookieInfo,
    };

    // Return diagnostic information
    return NextResponse.json(
      {
        status: 'success',
        authenticated: !!sessionData?.session,
        user: userData?.user
          ? {
              id: userData.user.id,
              email: userData.user.email,
              email_confirmed: !!userData.user.email_confirmed_at,
              last_sign_in: userData.user.last_sign_in_at,
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
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
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
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }
}
