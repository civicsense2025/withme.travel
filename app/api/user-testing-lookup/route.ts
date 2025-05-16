import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { z } from 'zod';

const USER_TESTING_TABLES = {
  USER_TESTING_SIGNUPS: 'user_testing_signups',
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase
    .from(USER_TESTING_TABLES.USER_TESTING_SIGNUPS)
    .select('id')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
  return NextResponse.json({ exists: !!data });
} 