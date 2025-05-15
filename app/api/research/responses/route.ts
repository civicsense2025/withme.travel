import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * Submit a form response
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient();
    const data = await request.json();
    
    const { form_id, session_id, responses, milestone } = data;
    
    if (!form_id || !session_id || !responses) {
      return NextResponse.json(
        { error: 'Form ID, session ID, and responses are required' },
        { status: 400 }
      );
    }
    
    // Get user ID from session if available
    let user_id = null;
    const { data: session, error: sessionError } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('user_id')
      .eq('id', session_id)
      .single();
    
    if (!sessionError && session?.user_id) {
      user_id = session.user_id;
    }
    
    // Create the response
    const { data: response, error } = await supabase
      .from(TABLES.FORM_RESPONSES)
      .insert({
        form_id,
        session_id,
        user_id,
        responses,
        milestone,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error submitting form response:', error);
    return NextResponse.json(
      { error: 'Failed to submit form response' },
      { status: 500 }
    );
  }
} 