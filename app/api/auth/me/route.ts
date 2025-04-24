import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    // Attempt to get the current user session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      // If there's an error or no user, it means the user is not authenticated
      console.log("API Me Route: No active session found or error retrieving user.", sessionError?.message);
      return NextResponse.json({ user: null, profile: null }, { status: 401 }); // Unauthorized
    }

    // If user is authenticated, fetch their profile from the 'profiles' table
    // Assumes you have a 'profiles' table where the 'id' column matches the auth.users 'id'
    const { data: profileData, error: profileError } = await supabase
      .from('profiles') // Your profile table name
      .select('name, avatar_url, is_admin') // Select specific columns as a comma-separated string
      .eq('id', user.id) // Match profile id with authenticated user id
      .maybeSingle(); // Use maybeSingle() if a user might not have a profile yet

    if (profileError) {
        console.error("API Me Route: Error fetching profile:", profileError.message);
        // Decide how to handle: return user without profile, or return an error?
        // Returning user basic info but null profile might be acceptable.
        return NextResponse.json({ 
          user: { id: user.id, email: user.email }, 
          profile: null 
        }, { status: 200 }); // Still return 200 OK, but profile is null
    }
    
    // Successfully fetched user and profile
    return NextResponse.json({ 
        user: { id: user.id, email: user.email }, // Return basic user info
        profile: profileData // Return fetched profile data
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Me Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred while fetching user data" }, { status: 500 });
  }
} 