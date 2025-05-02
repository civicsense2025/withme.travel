import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const { pollId, title, description, options, expiresAt } = await request.json();

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (pollId) {
      // Get specific poll with options and votes
      const { data, error } = await supabase.rpc('get_poll_with_options', {
        poll_id: pollId,
      });

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Get all polls for trip
      const { data: polls, error } = await supabase
        .from('trip_vote_polls')
        .select(
          `
          *,
          options:trip_vote_options(*)
        `
        )
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(polls);
    }
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
  }
}
