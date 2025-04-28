import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server"
import type { Database } from '@/types/database.types';

export async function GET(request: Request) {
  try {
    // Create Supabase client
    const supabase = createClient();

    // First, check if there's a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.log("API Me Route: No active session found or error retrieving session.", sessionError?.message);
      return NextResponse.json({ user: null, profile: null }, { status: 401 }); // Unauthorized
    }

    // If we have a session, verify the user (getSession already verifies, but getUser fetches user details)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // If there's an error or no user, it means the user is not authenticated
      console.log("API Me Route: No active user found or error retrieving user.", userError?.message);
      return NextResponse.json({ user: null, profile: null }, { status: 401 }); // Unauthorized
    }

    // If user is authenticated, fetch their profile from the 'profiles' table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles') // Your profile table name
      .select('id, name, avatar_url, username, is_admin') // Include all important profile fields
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