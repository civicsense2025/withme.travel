import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirect") || "/"
  const invitationToken = requestUrl.searchParams.get("invitation")
  const referralCode = requestUrl.searchParams.get("ref")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: cookieStore })

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    // Check if this is a new user from Google sign-in
    if (data?.user?.app_metadata?.provider === "google" && data?.user?.user_metadata) {
      // Check if user exists in our profiles table
      const { data: existingUser } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

      // If user doesn't exist, create a new record
      if (!existingUser) {
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.full_name || data.user.user_metadata.name,
            avatar_url: data.user.user_metadata.avatar_url,
            created_at: new Date().toISOString(),
            referred_by: referralCode || null,
          },
        ])

        if (insertError) {
          console.error("Error creating user record:", insertError)
        }
      }
    }

    // Handle invitation acceptance if present
    if (invitationToken) {
      try {
        const response = await fetch(`${requestUrl.origin}/api/invitations/${invitationToken}/accept`, {
          method: "POST",
          headers: {
            Cookie: cookieStore.toString(),
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.tripId) {
            // Redirect to the trip instead of the original redirect
            return NextResponse.redirect(`${requestUrl.origin}/trips/${data.tripId}`)
          }
        }
      } catch (error) {
        console.error("Error accepting invitation:", error)
        // Continue with normal redirect even if invitation acceptance fails
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
}
