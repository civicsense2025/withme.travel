import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { captureException } from '@sentry/nextjs';

/**
 * POST /api/auth/logout
 * Handles server-side session cleanup during sign out
 */
export async function POST(request: NextRequest) : Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  // Declare supabase outside the try block to ensure correct scope
  let userId = 'unknown';

  try {
    // Create Supabase client for signing out using our utility
    const supabase = await createRouteHandlerClient();

    // Get user ID *before* signing out
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        userId = session.user.id;
      }
      console.log(`[Auth] Attempting logout for user: ${userId}`);
    } catch (sessionError) {
      console.warn('[Auth] Failed to get session before logout:', sessionError);
    }

    // Attempt to sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Auth] Supabase sign out error:', error);
      captureException(error);
      return NextResponse.json(
        { error: error.message || 'Failed to sign out' },
        { status: error.status || 500, headers: responseHeaders }
      );
    }

    console.log(`[Auth] User ${userId} signed out successfully.`);
    return NextResponse.json({ success: true }, { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error('[Auth] Unexpected logout error:', error);
    captureException(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout.' },
      { status: 500, headers: responseHeaders }
    );
  }
}