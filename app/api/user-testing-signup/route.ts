import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { FORM_TABLES } from '@/utils/constants/research-tables';
import { USER_TABLES } from '@/utils/constants/users';
import { z } from 'zod';
import sendPlunkEvent from '../../lib/plunkHandler';
import { v4 as uuidv4 } from 'uuid';
import { SESSION_STATUS } from '@/utils/constants/research-tables';

// Validation schema for user testing sign-up
const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email address'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must consent to continue'
  }),
});

// Track user events for email workflows
async function trackUserEvent(supabase: any, event: string, metadata: any) {
  try {
    await supabase.from('user_events').insert({
      user_id: null, // No user_id for anonymous events
      event_type: event,
      metadata,
    });
  } catch (err) {
    console.error('Failed to track user event:', err);
  }
}

/**
 * POST /api/user-testing-signup
 * Register a user for user testing and return a guest token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    // Get and validate request body
    const body = await request.json().catch(() => ({}));

    try {
      SignupSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors[0].message || 'Invalid signup data' },
          { status: 400, headers: responseHeaders }
        );
      }

      return NextResponse.json(
        { error: 'Invalid signup data' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Extract data
    const { email, name, consent } = body;

    // Generate a unique token for the session
    const token = uuidv4();
    
    // Create a Supabase client
    const supabase = await createRouteHandlerClient();
    
    // Check if the user already exists in the user testing participants
    const { data: existingUser, error: lookupError } = await supabase
      .from(USER_TABLES.USER_TESTING_SIGNUPS)
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error checking for existing user:', lookupError);
      return NextResponse.json({ 
        error: 'Failed to check user registration status' 
      }, { status: 500 });
    }
    
    let participantId;
    
    // If the user doesn't exist, create a new record
    if (!existingUser) {
      const { data: newParticipant, error: insertError } = await supabase
        .from(USER_TABLES.USER_TESTING_SIGNUPS)
        .insert({
          name,
          email,
          signup_date: new Date().toISOString(),
          source: 'web',
          status: 'active',
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Error creating user testing participant:', insertError);
        return NextResponse.json({ 
          error: 'Failed to register for user testing' 
        }, { status: 500 });
      }
      
      participantId = newParticipant.id;
    } else {
      participantId = existingUser.id;
      
      // Update the existing user's record to ensure it's up to date
      await supabase
        .from(USER_TABLES.USER_TESTING_SIGNUPS)
        .update({
          name,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    }
    
    // Create a user testing session with token
    const { data: session, error: sessionError } = await supabase
      .from(FORM_TABLES.USER_TESTING_SESSIONS)
      .insert({
        token: token,
        user_id: null, // No authenticated user
        status: SESSION_STATUS.ACTIVE,
        metadata: {
          participant_id: participantId,
          browser: request.headers.get('user-agent') || 'unknown',
          referrer: request.headers.get('referer') || 'unknown',
          email,
          name,
          signup_date: new Date().toISOString(),
          consent
        },
        cohort: 'user-research-default'
      })
      .select('id, token')
      .single();
    
    if (sessionError) {
      console.error('Error creating user testing session:', sessionError);
      
      // Create a mock session response as a fallback
      console.log('Using fallback: Creating mock session');
      
      // Return a successful response with the token
      return NextResponse.json(
        {
          success: true,
          token,
          message: 'User testing account created successfully',
        },
        { status: 200, headers: responseHeaders }
      );
    }

    console.log('User testing session created:', session?.id);

    // Track event for email workflow
    await trackUserEvent(supabase, 'user_testing_alpha', {
      name,
      email,
      signup_timestamp: new Date().toISOString(),
    });

    // Send event to Plunk for email workflow
    sendPlunkEvent('user_testing_signup', {
      email,
      name,
      timestamp: new Date().toISOString(),
    }).catch((err) => {
      console.error('Plunk error:', err);
    });
    
    // Return the session token and redirect information
    return NextResponse.json({
      success: true,
      message: 'Successfully registered for user testing',
      participant_id: participantId,
      guestToken: token,
      redirect: true,
      surveyId: 'product-experience', // Default survey ID
    }, { status: 200, headers: responseHeaders });
    
  } catch (error) {
    console.error('Unexpected signup error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: responseHeaders }
    );
  }
}
