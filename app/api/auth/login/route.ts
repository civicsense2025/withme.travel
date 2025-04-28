import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { DB_TABLES, DB_FIELDS } from '@/utils/constants/database'
import { Profile } from '@/types/database.types'
import type { Database } from '@/types/database.types'
import { cookies } from 'next/headers'

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

  try {
    const supabase = createRouteHandlerClient<Database>({
      cookies: async () => {
        const cookieStore = await cookies();
        return cookieStore;
      }
    })

    // Check for rate limiting - optional enhancement
    // You might want to implement a more sophisticated rate limiting mechanism
    // This is a simple example that could be expanded
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `login_attempts:${clientIp}`;
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log the specific Supabase error for debugging
      console.error("Supabase Sign In Error:", error.message);
      
      // Provide a more specific error message based on the error type
      let clientErrorMessage = "Invalid login credentials";
      let statusCode = 401;
      
      if (error.message.includes("Email not confirmed")) {
        clientErrorMessage = "Email not confirmed. Please check your inbox to verify your account.";
      } else if (error.message.includes("Invalid login credentials")) {
        clientErrorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("rate limit")) {
        clientErrorMessage = "Too many login attempts. Please try again later.";
        statusCode = 429; // Too Many Requests
      }
      
      return NextResponse.json({ error: clientErrorMessage }, { status: statusCode });
    }

    // Check if we actually got a valid user and session
    if (!data.user || !data.session) {
      console.error("API Login: Authentication succeeded but missing user or session data");
      return NextResponse.json({ 
        error: "Authentication succeeded but session could not be established" 
      }, { status: 500 });
    }

    // Log successful login
    console.log(`API Login: User ${data.user.id} successfully authenticated`);

    // Explicitly refresh the session to ensure cookies are properly set
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session refresh error:", sessionError.message);
      return NextResponse.json({ error: "Failed to establish session" }, { status: 500 });
    }

    // Fetch user profile to return along with auth data
    let profileData = null;
    try {
      const { data: profile, error: profileError } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('id, name, avatar_url, username, is_admin')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profileError && profile) {
        profileData = profile;
      }
    } catch (profileError) {
      console.warn("API Login: Error fetching profile after successful login:", profileError);
      // Continue even if profile fetch fails - don't fail the login
    }

    // Return user, session, and profile data to help client-side state management
    return NextResponse.json({ 
      success: true,
      message: "Successfully authenticated",
      user: data.user,
      session: sessionData.session,
      profile: profileData
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Login Route Error:", error); // Log unexpected errors
    return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 });
  }
}
