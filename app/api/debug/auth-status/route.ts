import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';

// Force-dynamic export to ensure up-to-date information
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Check authentication status
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    // Don't attempt database checks if not authenticated
    let dbConnected = false;
    let dbError = null;
    let dbCheckErrorDetails: string | null = null;

    try {
      if (session) {
        // Only check database if authenticated
        // Use select with head: true and count: 'exact' for efficiency
        const { error: profileError, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        dbError = profileError;
        dbConnected = !profileError;
      } else {
        // Since we're not authenticated, do a minimal DB check
        // that doesn't require auth just to test connection
        // Use select with head: true and count: 'exact' for efficiency
        const { error: destinationError, count } = await supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true });

        dbConnected = !destinationError;
        dbError = destinationError;
      }
    } catch (e) {
      // Catch any unexpected errors during DB check
      console.error('Unexpected DB check error:', e);
      dbConnected = false;
      dbCheckErrorDetails = e instanceof Error ? e.message : String(e);
    }

    // Get information about auth configuration
    const config = {
      authEndpoint: process.env.NEXT_PUBLIC_SUPABASE_URL ? true : false,
      hasAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? true : false,
      authConfigured: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
    };

    // Always return 200 for status checks, even if unauthenticated
    return NextResponse.json(
      {
        status: 'ok',
        authenticated: !!session,
        authRequired: false, // Indicate auth is optional for checking
        user: session
          ? {
              id: session.user.id,
              email: session.user.email,
              hasProfile: true,
            }
          : null,
        databaseConnected: dbConnected,
        dbError: dbError ? { code: dbError.code, message: dbError.message } : null,
        config,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    ); // Always return 200 for status checks
  } catch (error) {
    console.error('Error checking auth status:', error);

    // Return 200 with error details for the status dashboard
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to check authentication status',
        errorDetails: error instanceof Error ? error.message : String(error),
        authenticated: false,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    ); // Use 200 to avoid triggering fetch errors
  }
}
