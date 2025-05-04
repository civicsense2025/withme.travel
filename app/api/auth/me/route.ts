import { NextRequest, NextResponse } from 'next/server';
// import { createServerSupabaseClient } from '@/utils/supabase/server'; // Old import
// import { cookies } from 'next/headers'; // Now handled by getRouteHandlerClient
// import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Now handled by getRouteHandlerClient
import { createRouteHandlerClient } from '@/utils/supabase/server'; // Use the unified helper
import { captureException } from '@sentry/nextjs';
import type { Database } from '@/types/database.types';

/**
 * GET /api/auth/me - Get authenticated user data
 *
 * Returns the current authenticated user with profile data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    // Create Supabase client using the unified helper
    // const cookieStore = await cookies();
    const supabase = await createRouteHandlerClient(); // Simplified client creation

    // Fetch user data
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    // Return user data with profile
    return NextResponse.json(
      {
        user: {
          ...user,
          profile: profile || null,
        },
        authenticated: true,
      },
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking authentication status' },
      { status: 500 }
    );
  }
}
