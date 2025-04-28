import { createApiClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server"

export async function GET() {
  try {
  const supabase = createClient()

    // Get session info
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // Get user info
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (sessionError) {
      return NextResponse.json({ 
        status: "error",
        source: "session",
        message: sessionError.message,
        details: sessionError
      }, { status: 500 })
    }
    
    if (userError) {
      return NextResponse.json({ 
        status: "error",
        source: "user",
        message: userError.message,
        details: userError
      }, { status: 500 })
    }
    
    // Return debugging information
    return NextResponse.json({
      status: "success",
      authenticated: !!userData.user,
      session: {
        exists: !!sessionData.session,
        expires_at: sessionData.session?.expires_at,
      },
      user: userData.user ? {
        id: userData.user.id,
        email: userData.user.email,
        provider: userData.user.app_metadata?.provider,
        created_at: userData.user.created_at,
      } : null,
    })
  } catch (error: any) {
    console.error("Auth debug error:", error)
    return NextResponse.json({ 
      status: "error",
      message: error.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 })
  }
} 