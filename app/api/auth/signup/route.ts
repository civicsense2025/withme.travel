import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password, username } = requestBody;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  
  // Basic password validation (example: minimum length)
  if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
  }

  const cookieStore = cookies()
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Include additional data like username if your Supabase setup expects it here
        // or handle profile creation separately after signup.
        // For now, let's assume username might be stored in user_metadata or a profile table.
        // If using a separate profiles table, we might need another step.
        data: {
          // Example: Storing username in user_metadata
          // This depends on your Supabase setup and policies
          // username: username || email.split('@')[0], // Default username if not provided
        }
      },
    })

    if (error) {
      console.error("Supabase Sign Up Error:", error.message);
      // Check for specific errors, e.g., user already exists
      if (error.message.includes("User already registered")) {
          return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 }); // 409 Conflict
      }
      return NextResponse.json({ error: "Failed to create account." }, { status: 400 });
    }
    
    // Check if user object exists, sign up might require email confirmation
    if (!data.user) {
         console.error("Supabase Sign Up: No user object returned, email confirmation might be required.");
         // Inform the user that confirmation is needed
         return NextResponse.json({ success: true, message: "Account created. Please check your email to confirm your account." }, { status: 201 }); // 201 Created
    }

    // If sign up doesn't require confirmation or it's disabled, user is created.
    // Create a corresponding profile entry in the 'profiles' table.
    const newUserId = data.user.id;
    const newUserEmail = data.user.email;
    const profileName = username || newUserEmail?.split('@')[0] || 'New User'; // Use provided username or default

    const { error: profileError } = await supabase
      .from('profiles') // Use DB_TABLES.PROFILES constant if available, otherwise string
      .insert({ 
          id: newUserId, // Link profile to the auth user ID
          email: newUserEmail, 
          name: profileName, 
          avatar_url: null, // Default avatar or potentially use data.user.user_metadata.avatar_url if available?
          is_admin: false, // Default role
          // Add other default fields from your Profile Insert type as needed
          // bio: null,
          // location: null,
          // website: null,
          // referred_by: requestBody.referralCode || null, // If you pass referral code in signup
      });

    if (profileError) {
      console.error(`Failed to create user profile (${newUserId}) after signup:`, profileError.message);
      // Decide how to handle this: Log it, but let signup succeed as the auth user exists.
      // Returning success here, but you might want more robust error handling/cleanup.
    } else {
      console.log(`Successfully created profile for user: ${newUserId}`);
    }

    // Sign up successful (user created, profile attempt made)
    // AuthProvider will call /api/auth/me to get user data after potential confirmation.
    // If email confirmation is enabled, the user object in the response might indicate this.
    const responseMessage = data.user.email_confirmed_at ? "Signup successful" : "Account created. Please check your email to confirm your account.";
    return NextResponse.json({ success: true, message: responseMessage }, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error("API Signup Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during sign up" }, { status: 500 });
  }
} 