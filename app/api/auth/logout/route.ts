import { createApiClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * Handles server-side session cleanup during sign out
 */
export async function POST() {
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Log which user is attempting to sign out
  let userId = 'unknown';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id || 'unknown';
    console.log(`[/api/auth/logout] Attempting sign out for user: ${userId}`);
  } catch (sessionError) {
    console.warn("[/api/auth/logout] Could not determine user ID for logging:", sessionError);
  }

  try {
    // Clear auth-related cookies first
    clearAuthCookies(cookieStore);
    
    // Sign out from Supabase (this will clear the session)
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all devices
    });

    if (error) {
      console.error(`[/api/auth/logout] Supabase sign out error for user ${userId}:`, error);
      return NextResponse.json({ 
        success: true, 
        warning: "Supabase reported an error during sign out, but cookies were cleared.",
        message: "You have been signed out",
        error: error.message
      }, { status: 200 });
    }

    // Double-check session to confirm logout was successful
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.warn(`[/api/auth/logout] Session still exists after logout for user ${userId}. Forcing cookie cleanup.`);
      // Try again to clear cookies
      clearAuthCookies(cookieStore);
      return NextResponse.json({ 
        success: true, 
        warning: "Session persisted after logout. Cookies have been forcibly cleared.",
        message: "You have been signed out"
      }, { status: 200 });
    }
    
    console.log(`[/api/auth/logout] User ${userId} successfully signed out`);
    return NextResponse.json({ 
      success: true, 
      message: "You have been successfully signed out"
    }, { status: 200 });

  } catch (error: any) {
    console.error(`[/api/auth/logout] Unexpected error during sign out for user ${userId}:`, error);
    
    // Try to clear cookies even if there was an error
    try {
      clearAuthCookies(cookieStore);
    } catch (cookieError) {
      console.error("[/api/auth/logout] Failed to clear cookies during error handling:", cookieError);
    }
    
    // Since we've tried to clear cookies, the user is effectively logged out client-side
    return NextResponse.json({ 
      success: true, 
      warning: "An error occurred, but you have been signed out.",
      error: error.message || "Unknown error during sign out"
    }, { status: 200 });
  }
}

/**
 * Helper function to clear all auth-related cookies
 */
function clearAuthCookies(cookieStore: ReturnType<typeof cookies>) {
  // List of all possible cookies used by Supabase and our app for auth
  const cookiesToClear = [
    // Supabase auth cookies
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    '__supabase_session_id',
    '__supabase_auth_token',
    'supabase-auth-refresh-token',
    'sb-provider-token',
    'sb-callback',
    
    // App-specific cookies that might store auth state
    'auth_redirect',
    'auth_state',
    'user_session',
    'is_authenticated',
    'access_token',
    'refresh_token',
    'id_token',
    'authenticated'
  ];
  
  // Count how many cookies were actually cleared
  let cookiesCleared = 0;
  
  // Try to delete each cookie
  for (const cookieName of cookiesToClear) {
    try {
      if (cookieStore.get(cookieName)) {
        cookieStore.delete(cookieName);
        cookiesCleared++;
      }
    } catch (e) {
      console.warn(`[/api/auth/logout] Failed to clear cookie ${cookieName}:`, e);
    }
  }
  
  console.log(`[/api/auth/logout] Cleared ${cookiesCleared} auth-related cookies`);
}
