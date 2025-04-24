import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// This endpoint clears all authentication cookies, to help resolve issues with corrupted cookie data
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Clear all Supabase auth-related cookies
    const cookiesToClear = [
      'supabase-auth-token',
      'sb-refresh-token',
      'sb-access-token',
      '__supabase_session_id'
    ]
    
    for (const cookieName of cookiesToClear) {
      try {
        cookieStore.delete(cookieName)
      } catch (e) {
        console.error(`Error clearing cookie ${cookieName}:`, e)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Authentication cookies cleared. You'll need to sign in again."
    })
  } catch (error) {
    console.error("Error clearing auth cookies:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to clear authentication cookies"
    }, { status: 500 })
  }
} 