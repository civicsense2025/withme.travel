import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { USER_TESTING_TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { TABLES } from '@/utils/constants/tables';

// Schema for session request
const SessionRequestSchema = z.object({
  metadata: z.record(z.string(), z.any()).optional()
});

/**
 * POST /api/research/user-testing-session
 * Create a new user testing session
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user's session
    const { data: { user } } = await supabase.auth.getUser();
    
    // If user is not authenticated, return 401
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user already has a session
    const { data: existingSession } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // If user already has a session, return it
    if (existingSession) {
      return NextResponse.json({ 
        session: existingSession,
        message: 'User already has a testing session'
      });
    }
    
    // Parse request body for optional fields like cohort
    let cohort = 'alpha'; // Default cohort
    
    try {
      const body = await req.json();
      if (body && body.cohort) {
        cohort = body.cohort;
      }
    } catch (e) {
      // If body parsing fails, continue with defaults
      console.log('No body provided, using default values');
    }
    
    // Generate a token
    const token = crypto.randomUUID();
    
    // Create a new session
    const { data: newSession, error } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .insert({
        user_id: user.id,
        token,
        status: 'active',
        cohort,
        metadata: {
          userAgent: req.headers.get('user-agent'),
          created_from: 'api'
        }
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating user testing session:', error);
      return NextResponse.json(
        { error: 'Failed to create user testing session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error in user testing session route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/user-testing-session
 * 
 * Fetches the user testing session for the authenticated user.
 * Returns the session if found, or a 404 if the user doesn't have a session.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user's session
    const { data: { user } } = await supabase.auth.getUser();
    
    // If user is not authenticated, return 401
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find the user testing session for this user
    const { data: session, error } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user testing session:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user testing session' },
        { status: 500 }
      );
    }
    
    // If no session found, return 404
    if (!session) {
      return NextResponse.json(
        { error: 'User testing session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in user testing session route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
