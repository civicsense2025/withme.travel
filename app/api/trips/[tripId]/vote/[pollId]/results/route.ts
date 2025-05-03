import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
// Direct table/field names used instead of imports
import { Database } from '@/types/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; pollId: string }> }
) {
  const { tripId, pollId } = await params;
  const supabase = createRouteHandlerClient();

  // Validate IDs
  if (!tripId || !/^\d+$/.test(tripId)) {
    return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
  }

  if (!pollId || !/^\d+$/.test(pollId)) {
    return NextResponse.json({ error: 'Invalid poll ID' }, { status: 400 });
  }

  try {
    // Get authenticated user
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
      .from('trip_vote_polls')
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
      .from('trip_vote_options')
      .select('id, text')
      .eq('poll_id', pollId)
      .order('id', { ascending: true });

    if (optionsError || !options) {
      console.error('Error fetching poll options:', optionsError);
      return NextResponse.json({ error: 'Failed to fetch poll options' }, { status: 500 });
    }

    // Fetch votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('trip_votes')
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

    // Calculate total votes
    const totalVotes = votes?.length || 0;

    // Calculate results with percentages
    const results = options.map((option) => {
      const optionVotes = votes?.filter((vote) => vote.option_id === option.id) || [];
      const voteCount = optionVotes.length;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

      return {
        option: {
          id: option.id,
          text: option.text,
        },
        votes: voteCount,
        percentage: percentage,
        voters: optionVotes.map((vote) => vote.users),
      };
    });

    // Group votes by option to get vote counts
    const voteCounts: Record<string, number> = {};
    votes?.forEach((vote: { option_id: string | number }) => {
      const optionId = vote.option_id;
      voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
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
      results,
      userVote: userVote ? userVote.option_id : null,
      totalVotes,
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
