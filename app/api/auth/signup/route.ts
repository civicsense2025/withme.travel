import { createApiClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DB_TABLES, DB_FIELDS } from '@/utils/constants/database'
import { Profile } from '@/types/database.types'
import { rateLimit } from '@/utils/middleware/rate-limit'
import { validateRequestCsrfToken } from '@/utils/csrf'
import { sanitizeAuthCredentials, sanitizeString } from '@/utils/sanitize'
import { validateRequestMiddleware, signupSchema } from '@/utils/validation'

// Rate limiting configuration for signup attempts
// 5 attempts per 10 minutes per IP address - stricter than login
const signupRateLimiter = rateLimit({
  limit: 5,
  windowMs: 600, // 10 minutes
});

// Handler for signup requests after validation
async function signupHandler(request: Request, validatedData: { email: string; password: string; username?: string }) {
  // Apply rate limiting to signup requests
  const rateLimitResult = await signupRateLimiter(request as any);
  if (rateLimitResult) {
    // Rate limit was hit, return the error response
    return rateLimitResult;
  }
  
  // Validate CSRF token
  if (!validateRequestCsrfToken(request)) {
    console.error('CSRF token validation failed for signup attempt');
    return NextResponse.json({ error: "Invalid security token" }, { status: 403 });
  }

  // Use the validated and sanitized data
  const { email, password, username } = sanitizeAuthCredentials(validatedData);

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
          // Sanitize any additional data
          username: username || email.split('@')[0],
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
    if (data.user) {
      // If sign up doesn't require confirmation or it's disabled, user is created.
      // Create a corresponding profile entry in the 'profiles' table.
      const newUserId = data.user.id;
      const newUserEmail = data.user.email;
      const profileName = username || newUserEmail?.split('@')[0] || 'New User'; // Use provided username or default

      const { error: profileError } = await supabase
        .from(DB_TABLES.PROFILES)
        .insert({ 
          id: newUserId, // Link profile to the auth user ID
          email: newUserEmail, 
          name: sanitizeString(profileName), 
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
    }

    // Sign up successful (user created, profile attempt made)
    // AuthProvider will call /api/auth/me to get user data after potential confirmation.
    // If email confirmation is enabled, the user object in the response might indicate this.
    const responseMessage = data.user?.email_confirmed_at 
      ? "Signup successful" 
      : "Account created. Please check your email to confirm your account.";
      
    return NextResponse.json({ success: true, message: responseMessage }, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error("API Signup Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during sign up" }, { status: 500 });
  }
}

// Export the POST handler with validation middleware
export const POST = validateRequestMiddleware(signupSchema, signupHandler); 