import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';
import sendPlunkEvent from '../../lib/plunkHandler';

// Track user events for email workflows
async function trackUserEvent(
  supabase: any,
  eventName: string,
  userData: { email: string; name: string; [key: string]: any }
) {
  try {
    await supabase.from(TABLES.USER_EVENTS).insert([
      {
        event_name: eventName,
        user_email: userData.email,
        user_name: userData.name,
        event_data: userData,
        source: 'user_testing_signup',
      },
    ]);
    // This would normally integrate with your email service (Plunk, etc.)
    console.log(`Event tracked: ${eventName} for ${userData.email}`);
  } catch (error) {
    console.error('Error tracking event:', error);
    // Non-blocking - we don't want to fail the main request
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const { name, email } = await request.json();

    // Basic validation
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = await createRouteHandlerClient();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from(TABLES.USER_TESTING_SIGNUPS)
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // User already signed up, return success without creating duplicate
      return NextResponse.json(
        {
          message: "Thank you for your interest! You're already signed up for user testing.",
          redirect: false, // Don't redirect to survey if already signed up
        },
        { status: 200 }
      );
    }

    // Insert new signup
    const { data, error } = await supabase.from(TABLES.USER_TESTING_SIGNUPS).insert([
      {
        name,
        email,
        signup_date: new Date().toISOString(),
        source: 'landing_page',
      },
    ]);

    if (error) {
      console.error('Error saving user testing signup:', error);
      return NextResponse.json(
        { error: 'Failed to save your information. Please try again.' },
        { status: 500 }
      );
    }

    // Track event for email workflow
    await trackUserEvent(supabase, 'user_testing_alpha', {
      name,
      email,
      timestamp: new Date().toISOString(),
    });

    // Send Plunk event for user testing alpha signup (non-blocking)
    sendPlunkEvent('user_testing_alpha_signup', { email, name }).catch((err) => {
      console.error('Plunk error:', err);
    });

    // Return success along with flag to redirect to survey
    return NextResponse.json(
      {
        message: 'Successfully signed up for user testing!',
        redirect: true, // Flag to redirect to the survey
        surveyId: 'user-testing-onboarding', // ID of survey to load
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in user testing signup route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
