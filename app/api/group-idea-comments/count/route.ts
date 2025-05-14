import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error verifying user:', userError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    // Count comments
    const { count, error: countError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_COMMENTS)
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (countError) {
      console.error('Error counting comments:', countError);
      return NextResponse.json({ error: 'Error counting comments' }, { status: 500 });
    }

    return NextResponse.json({
      count: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error in comment count API:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
