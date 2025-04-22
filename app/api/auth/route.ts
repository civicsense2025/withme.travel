import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
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

    // If redirect parameter exists, use it
    const redirectUrl = new URL(request.url).searchParams.get("redirect")
    const targetUrl = redirectUrl ? `${requestUrl.origin}${redirectUrl}` : requestUrl.origin

    return NextResponse.json({ success: true, redirectUrl: targetUrl }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 500 })
  }
}
