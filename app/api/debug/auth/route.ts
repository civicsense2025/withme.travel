import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const supabase = createClient()

  // Check for the specific cookie that's causing issues
  const authCookie = cookieStore.get('supabase-auth-token')
  let cookieParseError = null
  
  if (authCookie) {
    try {
      // Try parsing it
      JSON.parse(decodeURIComponent(authCookie.value))
    } catch (e) {
      cookieParseError = e instanceof Error ? e.message : String(e)
    }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return NextResponse.json({
      authenticated: !!user,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      cookieCount: allCookies.length,
      cookieNames: allCookies.map((c: { name: string }) => c.name),
      // Don't expose cookie values in production, this is for local debugging only
      supabaseCookie: authCookie ? 
        {
          exists: true,
          length: authCookie.value.length,
          firstChars: authCookie.value.substring(0, 20) + '...',
          parseError: cookieParseError
        } : null
    })
  } catch (error) {
    console.error("Error in auth debug:", error)
    return NextResponse.json({ 
      error: "Failed to check auth state",
      details: error instanceof Error ? error.message : String(error),
      cookieParseError: cookieParseError
    }, { status: 500 })
  }
} 