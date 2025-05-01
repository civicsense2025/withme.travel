import { createSupabaseServerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is a member of this trip
  const { data: isMember, error: memberError } = await supabase
    .from('trip_members')
    .select()
    .eq('trip_id', tripId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (memberError || !isMember) {
    return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
  }

  try {
    // Use the stored function to get activity timeline
    const { data, error } = await supabase.rpc('get_trip_activity_timeline', {
      trip_id_param: tripId,
      limit_param: limit,
      offset_param: offset,
    });

    if (error) throw error;

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('trip_history')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', tripId);

    if (countError) throw countError;

    return NextResponse.json({
      activity: data,
      pagination: {
        total: totalCount,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching trip activity:', error);
    return NextResponse.json({ error: 'Failed to fetch trip activity' }, { status: 500 });
  }
}
