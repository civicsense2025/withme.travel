import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { USER_TESTING_TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

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
    const body = await req.json();
    
    // Validate request body
    let validatedData;
    try {
      validatedData = SessionRequestSchema.parse(body);
    } catch (error) {
      console.error('Invalid session request data:', error);
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();
    
    // Get current user if authenticated
    let userId;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (error) {
      // Continue without user ID if authentication fails
      console.error('Auth error while creating session:', error);
    }

    // Generate a unique token for this session
    const token = uuidv4();
    const session = {
      id: uuidv4(),
      user_id: userId,
      token,
      status: 'active',
      metadata: validatedData.metadata || {},
      created_at: new Date().toISOString()
    };

    // Insert session into database
    const { data, error } = await supabase
      .from(USER_TESTING_TABLES.USER_TESTING_SESSIONS)
      .insert(session)
      .select('id, token, status, created_at')
      .single();
    
    if (error) {
      console.error('Error creating user testing session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: data.id,
        token: data.token,
        status: data.status,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    console.error('Unhandled error in user testing session API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/user-testing-session
 * Validate and retrieve current user testing session
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();
    
    // Get session by token
    const { data, error } = await supabase
      .from(USER_TESTING_TABLES.USER_TESTING_SESSIONS)
      .select('id, token, status, created_at, completed_at')
      .eq('token', token)
      .single();
    
    if (error) {
      console.error('Error validating session token:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: data.id,
        token: data.token,
        status: data.status,
        createdAt: data.created_at,
        completedAt: data.completed_at
      }
    });
  } catch (error) {
    console.error('Unhandled error in user testing session validation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
