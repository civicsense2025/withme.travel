import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * Get session by token
 */
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient();
    
    // Try to find by session_token first
    const { data, error } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('*')
      .eq('session_token', token)
      .single();
    
    if (error) {
      // If not found, try guest_token
      const { data: guestData, error: guestError } = await supabase
        .from(TABLES.USER_TESTING_SESSIONS)
        .select('*')
        .eq('guest_token', token)
        .single();
      
      if (guestError) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(guestData);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user testing session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testing session' },
      { status: 500 }
    );
  }
} 