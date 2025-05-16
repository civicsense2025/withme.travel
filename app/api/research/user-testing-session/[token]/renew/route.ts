import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * POST /api/research/user-testing-session/[token]/renew
 * 
 * Renews an expired user testing session token.
 * Updates the status to 'active' and clears the completed_at timestamp.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createRouteHandlerClient();
    
    // First check if the token exists
    const { data: existingSession, error: checkError } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('*')
      .eq('token', token)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      console.error('Error checking session:', checkError);
      return NextResponse.json(
        { error: 'Failed to check session' },
        { status: 500 }
      );
    }
    
    // Renew the session by updating its status
    const { data: updatedSession, error: updateError } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .update({
        status: 'active',
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('token', token)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('Error renewing session:', updateError);
      return NextResponse.json(
        { error: 'Failed to renew session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      session: updatedSession,
      message: 'Session renewed successfully'
    });
  } catch (error) {
    console.error('Error in renew session route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 