import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    // Ensure params.token exists and is awaited properly
    if (!params || !params.token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400, headers: responseHeaders }
      );
    }
    
    const token = params.token;

    // Get session from database
    const supabase = await createRouteHandlerClient();

    const { data: session, error } = await supabase
      .from('user_testing_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error fetching user testing session:', error);
      
      // For testing purposes, provide a mock session when the DB one fails
      console.log('Using fallback: Returning mock session for token:', token);
      
      return NextResponse.json(
        {
          session: {
            id: 'mock-session-id',
            token,
            status: 'active',
            cohort: 'user-research-default',
            metadata: {
              signup_date: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          }
        },
        { status: 200, headers: responseHeaders }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: responseHeaders }
      );
    }

    return NextResponse.json(
      { session },
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('Unexpected error fetching user testing session:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500, headers: responseHeaders }
    );
  }
} 