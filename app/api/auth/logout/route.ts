import { createApiClient } from '@/utils/supabase/api';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Handles server-side session cleanup during sign out
 */
export async function POST() {
  const cookieStore = cookies();
  const supabase = createApiClient(cookieStore);

  // Log which user is attempting to sign out
  let userId = 'unknown';
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    userId = session?.user?.id || 'unknown';
    console.log(`[/api/auth/logout] Attempting sign out for user: ${userId}`);
  } catch (sessionError) {
    console.warn('[/api/auth/logout] Could not determine user ID for logging:', sessionError);
  }

  try {
    // Sign out from Supabase (this will clear the session and handle cookies)
    const { error } = await supabase.auth.signOut({
      scope: 'global', // Sign out from all devices
    });

    if (error) {
      console.error(`[/api/auth/logout] Supabase sign out error for user ${userId}:`, error);
      return NextResponse.json(
        {
          success: true,
          warning: 'Supabase reported an error during sign out.',
          message: 'You have been signed out',
          error: error.message,
        },
        { status: 200 }
      );
    }

    // Double-check session to confirm logout was successful
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      console.warn(`[/api/auth/logout] Session still exists after logout for user ${userId}.`);

      // Try signing out once more
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          success: true,
          warning: 'Session persisted after logout. Forced session termination.',
          message: 'You have been signed out',
        },
        { status: 200 }
      );
    }

    console.log(`[/api/auth/logout] User ${userId} successfully signed out`);
    return NextResponse.json(
      {
        success: true,
        message: 'You have been successfully signed out',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[/api/auth/logout] Unexpected error during sign out for user ${userId}:`, error);

    // Since we've tried to clear session, the user is effectively logged out client-side
    return NextResponse.json(
      {
        success: true,
        warning: 'An error occurred, but you have been signed out.',
        error: error.message || 'Unknown error during sign out',
      },
      { status: 200 }
    );
  }
}
