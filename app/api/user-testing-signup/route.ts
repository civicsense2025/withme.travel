import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { FORM_TABLES } from '@/utils/constants/research-tables';
import { z } from 'zod';
import sendPlunkEvent from '../../lib/plunkHandler';

// Define our own table constant for user testing signups
const USER_TESTING_TABLES = {
  USER_TESTING_SIGNUPS: 'user_testing_signups'
};

// Validation schema for user testing sign-up
const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email address'),
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = SignupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: result.error.issues 
      }, { status: 400 });
    }
    
    const { name, email } = result.data;
    
    // Create a Supabase client
    const supabase = await createRouteHandlerClient();
    
    // Check if the user already exists in the user testing participants
    const { data: existingUser, error: lookupError } = await supabase
      .from(USER_TESTING_TABLES.USER_TESTING_SIGNUPS)
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
        .from(USER_TESTING_TABLES.USER_TESTING_SIGNUPS)
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
        .from(USER_TESTING_TABLES.USER_TESTING_SIGNUPS)
        .update({
          name,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    }
    
    // Create a user testing session with token
    const token = crypto.randomUUID();
    const { data: session, error: sessionError } = await supabase
      .from(FORM_TABLES.USER_TESTING_SESSIONS)
      .insert({
        token: token,
        user_id: null, // No authenticated user
        status: 'active',
        metadata: {
          participant_id: participantId,
          browser: request.headers.get('user-agent') || 'unknown',
          referrer: request.headers.get('referer') || 'unknown',
        }
      })
      .select('id, token')
      .single();
    
    if (sessionError) {
      console.error('Error creating user testing session:', sessionError);
      return NextResponse.json({ 
        error: 'Failed to create testing session' 
      }, { status: 500 });
    }
    
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
    });
    
  } catch (error) {
    console.error('Unhandled error in user testing signup:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
