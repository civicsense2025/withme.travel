import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

/**
 * Validates that a redirect URL is safe
 * This prevents open redirect vulnerabilities
 */
function isValidRedirectUrl(url: string): boolean {
  try {
    // If the URL is relative (starts with /), it's always safe
    if (url.startsWith('/')) return true;
    
    // If it's an absolute URL, verify it's for our domain
    const parsedUrl = new URL(url);
    const allowedHosts = [
      'localhost',
      'withme.travel',
      '127.0.0.1',
      // Add other allowed domains here
    ];
    
    return allowedHosts.some(host => 
      parsedUrl.hostname === host || 
      parsedUrl.hostname.endsWith(`.${host}`)
    );
  } catch (error) {
    // If URL parsing fails, reject the URL
    console.error("Invalid redirect URL:", url, error);
    return false;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirect") || "/"
  const invitationToken = requestUrl.searchParams.get("invitation")
  const referralCode = requestUrl.searchParams.get("ref")

  // Log information about the callback for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log("[Auth Callback] Processing auth callback:", { 
      url: request.url,
      redirectTo,
      hasCode: !!code,
      hasInvitation: !!invitationToken,
      hasReferral: !!referralCode
    });
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient()

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("[Auth Callback] Successfully exchanged code for session for user:", data?.user?.id);
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
        } else if (process.env.NODE_ENV === 'development') {
          console.log("[Auth Callback] Created new user profile for:", data.user.id);
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
            const tripRedirectUrl = `${requestUrl.origin}/trips/${data.tripId}`;
            if (process.env.NODE_ENV === 'development') {
              console.log("[Auth Callback] Redirecting to trip:", tripRedirectUrl);
            }
            return NextResponse.redirect(tripRedirectUrl)
          }
        }
      } catch (error) {
        console.error("Error accepting invitation:", error)
        // Continue with normal redirect even if invitation acceptance fails
      }
    }
  }

  // Validate the redirect URL to prevent open redirect vulnerabilities
  let finalRedirectUrl: string;
  
  if (redirectTo.startsWith('http') && !isValidRedirectUrl(redirectTo)) {
    console.warn("[Auth Callback] Blocked potential open redirect to:", redirectTo);
    // If the redirect URL is suspicious, redirect to home instead
    finalRedirectUrl = `${requestUrl.origin}/`;
  } else if (redirectTo.startsWith('http')) {
    // Already a full URL that passed validation
    finalRedirectUrl = redirectTo;
  } else {
    // It's a relative path - construct the full URL
    finalRedirectUrl = `${requestUrl.origin}${redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log("[Auth Callback] Final redirect URL:", finalRedirectUrl);
  }

  return NextResponse.redirect(finalRedirectUrl)
}
