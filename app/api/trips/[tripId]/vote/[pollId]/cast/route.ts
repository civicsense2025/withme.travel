import { createSupabaseServerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; pollId: string }> }
) {
  const { tripId, pollId } = await params;

  // Validate trip ID and poll ID
  if (!tripId || !/^\d+$/.test(tripId)) {
    return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
  }

  if (!pollId || !/^\d+$/.test(pollId)) {
    return NextResponse.json({ error: 'Invalid poll ID' }, { status: 400 });
  }

  try {
    const requestData = await request.json();
    const { optionId } = requestData;

    if (!optionId || !/^\d+$/.test(optionId)) {
      return NextResponse.json({ error: 'Invalid option ID' }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Verify user is a member of this trip
    const { data: tripMember, error: tripMemberError } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();

    if (tripMemberError || !tripMember) {
      return NextResponse.json({ error: 'You are not a member of this trip' }, { status: 403 });
    }

    // Check if poll exists and belongs to this trip
    const { data: poll, error: pollError } = await supabase
      .from('trip_polls')
      .select('id, expires_at')
      .eq('id', pollId)
      .eq('trip_id', tripId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found or does not belong to this trip' },
        { status: 404 }
      );
    }

    // Check if poll has expired
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This poll has expired' }, { status: 400 });
    }

    // Check if option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from('trip_poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Option not found or does not belong to this poll' },
        { status: 404 }
      );
    }

    // Delete any existing votes from this user for this poll
    await supabase.from('trip_poll_votes').delete().eq('poll_id', pollId).eq('user_id', userId);

    // Insert the new vote
    const { error: voteError } = await supabase.from('trip_poll_votes').insert({
      poll_id: parseInt(pollId),
      option_id: parseInt(optionId),
      user_id: userId,
    });

    if (voteError) {
      console.error('Error recording vote:', voteError);
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
