import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

// This endpoint clears all authentication cookies and local storage, to help resolve issues with corrupted auth data
// Changed from GET to POST for better security (state-changing operations should use POST)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    // Try to sign out from Supabase first (if there's an active session)
    try {
      await supabase.auth.signOut({ scope: 'global' })
      console.log("API Clear Cookies: Successfully signed out active session")
    } catch (signOutError) {
      console.warn("API Clear Cookies: Could not sign out active session", signOutError)
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
      'is_authenticated'
    ]
    
    const clearedCookies = []
    const failedCookies = []
    
    for (const cookieName of cookiesToClear) {
      try {
        // Only attempt to delete if the cookie exists
        if (cookieStore.get(cookieName)) {
          cookieStore.delete(cookieName)
          clearedCookies.push(cookieName)
        }
      } catch (e) {
        console.error(`Error clearing cookie ${cookieName}:`, e)
        failedCookies.push(cookieName)
      }
    }
    
    console.log(`API Clear Cookies: Cleared ${clearedCookies.length} cookies, failed to clear ${failedCookies.length} cookies`)
    
    return NextResponse.json({ 
      success: true, 
      message: "Authentication data cleared. You'll need to sign in again.",
      details: {
        cookies_cleared: clearedCookies,
        cookies_failed: failedCookies
      }
    })
  } catch (error) {
    console.error("Error clearing auth cookies:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to clear authentication cookies"
    }, { status: 500 })
  }
}

// Keep GET method for backward compatibility, but it just redirects to POST
export async function GET(request: NextRequest) {
  console.warn("API Clear Cookies: GET method is deprecated, use POST instead")
  
  try {
    // Call the POST handler directly
    return await POST(request)
  } catch (error) {
    console.error("Error in GET redirect to POST:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to clear authentication cookies",
      note: "Please use POST method instead of GET for this endpoint"
    }, { status: 500 })
  }
} 
