import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { FORM_TABLES } from '@/utils/constants/research-tables';
import { USER_TABLES } from '@/utils/constants/users';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { SESSION_STATUS } from '@/utils/constants/research-tables';

// Using shared constant from utils/constants/users
// const USER_TESTING_TABLES = {
//   USER_TESTING_SIGNUPS: 'user_testing_signups',
// };

const LoginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('[API] user-testing-login: Request received');
  
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    const body = await request.json().catch((err) => {
      console.error('[API] user-testing-login: JSON parse error', err);
      return {};
    });
    
    console.log('[API] user-testing-login: Request body received', body);
    
    try {
      LoginSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('[API] user-testing-login: Validation error', validationError.errors);
        return NextResponse.json(
          { error: validationError.errors[0].message || 'Invalid login data' },
          { status: 400, headers: responseHeaders }
        );
      }
      return NextResponse.json(
        { error: 'Invalid login data' },
        { status: 400, headers: responseHeaders }
      );
    }
    
    const { email } = body;
    console.log('[API] user-testing-login: Email validated', email);
    
    const token = uuidv4();
    const supabase = await createRouteHandlerClient();
    
    // Check if user exists
    console.log('[API] user-testing-login: Checking if user exists in database');
    const { data: existingUser, error: lookupError } = await supabase
      .from(USER_TABLES.USER_TESTING_SIGNUPS)
      .select('id, email, name')
      .eq('email', email)
      .single();
      
    if (lookupError) {
      console.error('[API] user-testing-login: User lookup error', lookupError);
      return NextResponse.json(
        { error: 'No user found with that email. Please sign up first.' },
        { status: 404, headers: responseHeaders }
      );
    }
    
    if (!existingUser) {
      console.log('[API] user-testing-login: No user found with email', email);
      return NextResponse.json(
        { error: 'No user found with that email. Please sign up first.' },
        { status: 404, headers: responseHeaders }
      );
    }
    
    console.log('[API] user-testing-login: User found', existingUser.id);
    const participantId = existingUser.id;
    
    // Create a user testing session with token
    console.log('[API] user-testing-login: Creating user testing session');
    const { data: session, error: sessionError } = await supabase
      .from(FORM_TABLES.USER_TESTING_SESSIONS)
      .insert({
        token: token,
        user_id: null,
        status: SESSION_STATUS.ACTIVE,
        metadata: {
          participant_id: participantId,
          browser: request.headers.get('user-agent') || 'unknown',
          referrer: request.headers.get('referer') || 'unknown',
          email,
          name: existingUser.name,
          login_date: new Date().toISOString(),
        },
        cohort: 'user-research-default',
      })
      .select('id, token')
      .single();
      
    if (sessionError) {
      console.error('[API] user-testing-login: Session creation error', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session.' },
        { status: 500, headers: responseHeaders }
      );
    }
    
    console.log('[API] user-testing-login: Session created successfully', session?.id);
    return NextResponse.json(
      { token },
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('[API] user-testing-login: Unexpected error', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: responseHeaders }
    );
  }
} 