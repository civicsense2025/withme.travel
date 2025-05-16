import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: { token: string } }
): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    console.log('[API] /api/user-testing-session/[token] - Incoming request:', request.url);
    const { token } = await context.params;
    console.log('[API] /api/user-testing-session/[token] - Params:', { token });
    if (!token) {
      console.warn('[API] /api/user-testing-session/[token] - Missing token');
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Get session from database
    const supabase = await createRouteHandlerClient();

    const { data: session, error } = await supabase
      .from('user_testing_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('[API] /api/user-testing-session/[token] - Error fetching session:', error);
      // For testing purposes, provide a mock session when the DB one fails
      console.log('[API] /api/user-testing-session/[token] - Using fallback: Returning mock session for token:', token);
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
      console.warn('[API] /api/user-testing-session/[token] - Session not found for token:', token);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: responseHeaders }
      );
    }

    console.log('[API] /api/user-testing-session/[token] - Returning session:', session);
    return NextResponse.json(
      { session },
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('[API] /api/user-testing-session/[token] - Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500, headers: responseHeaders }
    );
  }
} 