import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[Debug] Checking auth status")
    const supabase = createClient()

    // Check session status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Check user status
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Get additional user data if available
    let userData = null
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileError) {
        userData = profile
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      auth_status: {
        has_session: !!session,
        session_error: sessionError?.message,
        has_user: !!user,
        user_error: userError?.message,
        user_id: user?.id,
        user_email: user?.email,
        user_metadata: user?.user_metadata,
        auth_provider: user?.app_metadata?.provider,
        last_sign_in: user?.last_sign_in_at,
      },
      user_data: userData,
    })
  } catch (error: any) {
    console.error("[Debug] Auth status check error:", error)
    return NextResponse.json({
      error: "Failed to check auth status",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
} 