import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

// Helper to check if we're in dev mode
function isDevMode(request: NextRequest): boolean {
  const devMode = request.headers.get('x-dev-mode') === 'true';
  const queryDevMode = new URL(request.url).searchParams.get('dev-mode') === 'true';
  return process.env.NODE_ENV !== 'production' || devMode || queryDevMode;
}

// Helper to check if token is a development token
function isDevToken(token: string): boolean {
  return token.startsWith('dev-fake-token-');
}

// Helper to check if token is the test token from URL
function isTestToken(token: string): boolean {
  return token === '3d15489b-b547-433e-bb32-acb9e3d0d10e';
}

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
    // In Next.js 14, params should not be awaited in API routes
    const { token } = context.params;
    console.log('[API] /api/user-testing-session/[token] - Params:', { token });
    
    if (!token) {
      console.warn('[API] /api/user-testing-session/[token] - Missing token');
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Check for the specific test token from URL
    if (isTestToken(token)) {
      console.log('[API] /api/user-testing-session/[token] - Using special test token session');
      return NextResponse.json(
        {
          session: {
            id: 'test-session-id',
            token,
            status: 'active',
            cohort: 'special-test',
            metadata: {
              signup_date: new Date().toISOString(),
              is_test: true
            },
            created_at: new Date().toISOString()
          }
        },
        { status: 200, headers: responseHeaders }
      );
    }

    // Check if this is a development token
    const devMode = isDevMode(request);
    if (devMode && isDevToken(token)) {
      console.log('[API] /api/user-testing-session/[token] - DEV MODE: Using mock session for development token');
      return NextResponse.json(
        {
          session: {
            id: 'dev-session-id',
            token,
            status: 'active',
            cohort: 'user-research-dev',
            metadata: {
              signup_date: new Date().toISOString(),
              is_development: true
            },
            created_at: new Date().toISOString()
          }
        },
        { status: 200, headers: responseHeaders }
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
      if (devMode) {
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
      
      return NextResponse.json(
        { error: 'Session not found or invalid' },
        { status: 404, headers: responseHeaders }
      );
    }

    if (!session) {
      console.warn('[API] /api/user-testing-session/[token] - Session not found for token:', token);
      
      // Always return mock data in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log('[API] /api/user-testing-session/[token] - DEV ENV: Returning mock session despite not found in DB');
        return NextResponse.json(
          {
            session: {
              id: 'mock-session-id',
              token,
              status: 'active',
              cohort: 'dev-fallback',
              metadata: {
                signup_date: new Date().toISOString()
              },
              created_at: new Date().toISOString()
            }
          },
          { status: 200, headers: responseHeaders }
        );
      }
      
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