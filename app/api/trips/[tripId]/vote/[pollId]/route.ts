import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; pollId: string }> }
) {
  const { tripId, pollId } = await params;

  // Validate IDs
  if (!tripId || !/^\d+$/.test(tripId)) {
    return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
  }

  if (!pollId || !/^\d+$/.test(pollId)) {
    return NextResponse.json({ error: 'Invalid poll ID' }, { status: 400 });
  }

  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
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

    // Fetch the poll details
    const { data: poll, error: pollError } = await supabase
      .from('trip_polls')
      .select(
        `
        id,
        title,
        description,
        created_at,
        expires_at,
        created_by,
        users (
          id,
          email,
          profiles (
            username,
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq('id', pollId)
      .eq('trip_id', tripId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Fetch poll options
    const { data: options, error: optionsError } = await supabase
      .from('trip_poll_options')
      .select('id, text')
      .eq('poll_id', pollId)
      .order('id', { ascending: true });

    if (optionsError) {
      console.error('Error fetching poll options:', optionsError);
      return NextResponse.json({ error: 'Failed to fetch poll options' }, { status: 500 });
    }

    // Fetch votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('trip_poll_votes')
      .select(
        `
        id,
        option_id,
        user_id,
        created_at,
        users (
          id,
          email,
          profiles (
            username,
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq('poll_id', pollId);

    if (votesError) {
      console.error('Error fetching poll votes:', votesError);
      return NextResponse.json({ error: 'Failed to fetch poll votes' }, { status: 500 });
    }

    // Get the user's current vote
    const userVote = votes?.find((vote) => vote.user_id === userId);

    // Calculate results
    const results = options?.map((option) => {
      const optionVotes = votes?.filter((vote) => vote.option_id === option.id) || [];
      return {
        option: option,
        votes: optionVotes.length,
        voters: optionVotes.map((vote) => vote.users),
      };
    });

    // Check if poll is expired
    const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;

    return NextResponse.json({
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        createdAt: poll.created_at,
        expiresAt: poll.expires_at,
        createdBy: poll.users,
        isExpired,
      },
      options,
      results,
      userVote: userVote ? userVote.option_id : null,
      totalVotes: votes?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching poll details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
