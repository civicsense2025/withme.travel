import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * GET /api/research/user-testing-session/[token]
 * Returns the user testing session for the given token, including cohort info.
 */
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;
  const supabase = await createRouteHandlerClient();

  // Fetch the session by token
  const { data, error } = await supabase
    .from(TABLES.USER_TESTING_SESSIONS)
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ session: data });
}
