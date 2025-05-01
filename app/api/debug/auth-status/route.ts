import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Force-dynamic export to ensure up-to-date information
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Check authentication status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    // Don't attempt database checks if not authenticated
    let dbConnected = false;
    let dbError = null;
    
    if (session) {
      // Only check database if authenticated
      const dbResponse = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)
        .single();
      
      dbError = dbResponse.error;
      dbConnected = !dbError || (dbError && !dbError.message.includes('connect'));
    } else {
      // Since we're not authenticated, do a minimal DB check 
      // that doesn't require auth just to test connection
      try {
        // Try a public table or view if available
        const { error } = await supabase
          .from('destinations')
          .select('count(*)')
          .limit(1)
          .single();
          
        dbConnected = !error || (error && !error.message.includes('connect'));
        dbError = error;
      } catch (e) {
        // DB connection likely failed
        dbConnected = false;
      }
    }
    
    // Get information about auth configuration
    const config = {
      authEndpoint: process.env.NEXT_PUBLIC_SUPABASE_URL ? true : false,
      hasAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? true : false,
      authConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    };
    
    // Always return 200 for status checks, even if unauthenticated
    return NextResponse.json({
      status: 'ok',
      authenticated: !!session,
      authRequired: false, // Indicate auth is optional for checking
      user: session ? {
        id: session.user.id,
        email: session.user.email,
        hasProfile: true,
      } : null,
      databaseConnected: dbConnected,
      dbError: dbError ? { code: dbError.code, message: dbError.message } : null,
      config,
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Always return 200 for status checks
  } catch (error) {
    console.error('Error checking auth status:', error);
    
    // Return 200 with error details for the status dashboard
    return NextResponse.json({
      status: 'error',
      error: 'Failed to check authentication status',
      errorDetails: error instanceof Error ? error.message : String(error),
      authenticated: false,
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Use 200 to avoid triggering fetch errors
  }
}
