import { createServerClient } from '@supabase/ssr'
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from '@/types/database.types'

export async function GET() {
  try {
    console.log("[Debug] Checking auth status")
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, expires: new Date(0) })
          },
        },
      }
    )

    // Check session status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Check user status
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Get additional user data if available
    let userData = null
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
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