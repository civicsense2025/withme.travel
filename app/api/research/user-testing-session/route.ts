import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Zod schema for a user testing session
const UserTestingSessionSchema = z.object({
  user_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// POST /api/research/user-testing-session
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  try {
    const body = await request.json().catch(() => ({}));
    
    // Validate session data if provided
    const result = UserTestingSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session data', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    // Create session with a unique token
    const token = uuidv4();
    const now = new Date().toISOString();
    
    // Get basic client metadata
    const userAgent = request.headers.get('user-agent') || '';
    const clientMetadata = {
      userAgent,
      createdAt: now,
      ...body.metadata
    };
    
    // Insert session into database
    const { data, error } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .insert([{
        token,
        user_id: body.user_id || null,
        status: 'active',
        metadata: clientMetadata,
        created_at: now
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Store session ID in a secure cookie for future requests
    cookies().set('withme_research_session', data.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    
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
    console.error('Unexpected error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create user testing session' },
      { status: 500 }
    );
  }
}
