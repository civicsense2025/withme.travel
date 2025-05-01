import { createApiClient } from '@/utils/supabase/api';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';
import { Database } from '@/types/database.types';
import { rateLimit, withRateLimit } from '@/utils/middleware/rate-limit';
import { sanitizeAuthCredentials, sanitizeString } from '@/utils/sanitize';
import { cookies } from 'next/headers';

// Validate email format with a better regex
const isValidEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Validate password strength
const isStrongPassword = (password: string): boolean => {
  return password.length >= 8; // Simplified check - more checks can be added
};

/**
 * POST /api/auth/signup
 * Handles user sign up with email validation
 */
async function signupHandler(request: Request) {
  try {
    // Get cookies for session handling
    const cookieStore = cookies();
    
    // Parse and validate request body
    const body = await request.json();
    const { email, password, username } = sanitizeAuthCredentials(body);

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createApiClient(cookieStore);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=/onboarding`,
      },
    });

    if (error) {
      console.error('[/api/auth/signup] Sign up error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    const newUserId = data.user?.id;
    const newUserEmail = data.user?.email;

    if (!newUserId) {
      return NextResponse.json(
        { error: 'User was created but no user ID was returned.' },
        { status: 500 }
      );
    }

    try {
      // Create a profile for the new user
      const profileName = username || newUserEmail?.split('@')[0] || 'New User'; // Use provided username or default

      const { error: profileError } = await supabase.from('profiles').insert({
        id: newUserId, // Link profile to the auth user ID
        email: newUserEmail,
        name: sanitizeString(profileName),
        username: sanitizeString(username || profileName.toLowerCase().replace(/\s+/g, '_')),
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('[/api/auth/signup] Profile creation error:', profileError);
        // Continue anyway - profile can be created later
      }
    } catch (profileCreationError) {
      console.error('[/api/auth/signup] Error creating profile:', profileCreationError);
      // Continue anyway - auth account was still created
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please check your email to confirm your account.',
        requiresEmailConfirmation: !data.session, // If no session, email confirmation is required
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[/api/auth/signup] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Apply rate limiting - 5 attempts per 10 minutes
export const POST = withRateLimit(signupHandler, {
  limit: 5,
  windowMs: 600, // 10 minutes
});
