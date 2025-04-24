import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = requestBody;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const cookieStore = cookies()
  const supabase = createClient()

  try {
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log the specific Supabase error for debugging
      console.error("Supabase Sign In Error:", error.message);
      // Provide a generic error message to the client
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 }); // Use 401 for auth failure
    }

    // Explicitly refresh the session to ensure cookies are properly set
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session refresh error:", sessionError.message);
      return NextResponse.json({ error: "Failed to establish session" }, { status: 500 });
    }

    // Return user and session data to help client-side state management
    return NextResponse.json({ 
      success: true,
      user: data.user,
      session: sessionData.session
    }, { status: 200 })

  } catch (error: any) {
    console.error("API Login Route Error:", error); // Log unexpected errors
    return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 });
  }
} 