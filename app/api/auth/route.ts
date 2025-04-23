import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Determine the redirect URL
    const redirectUrl = requestUrl.searchParams.get("redirect") || "/"
    
    return NextResponse.json({ 
      success: true, 
      user: data.user,
      redirectUrl
    }, { status: 200 })
  } catch (error: any) {
    console.error("API auth error:", error)
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 500 })
  }
}
