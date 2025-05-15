import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new user testing session
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient();
    const data = await request.json();
    
    const { user_id, metadata = {} } = data;
    const sessionToken = uuidv4();
    const guestToken = !user_id ? uuidv4() : null;
    
    const { data: session, error } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .insert({
        user_id,
        guest_token: guestToken,
        session_token: sessionToken,
        status: 'active',
        metadata,
      })
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating user testing session:', error);
    return NextResponse.json(
      { error: 'Failed to create testing session' },
      { status: 500 }
    );
  }
} 