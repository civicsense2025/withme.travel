import { createApiClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  // Validate trip ID
  if (!tripId || !/^\d+$/.test(tripId)) {
    return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
  }

  try {
    // Get authenticated user
    const supabase = await createApiClient();
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

    // Get all polls for this trip with options and vote counts
    const { data: polls, error: pollsError } = await supabase
      .from('trip_polls')
      .select(
        `
        id,
        title,
        description,
        is_active,
        created_by,
        expires_at,
        created_at,
        updated_at
      `
      )
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (pollsError) {
      console.error('Error fetching polls:', pollsError);
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
    }

    // If no polls found, return empty array
    if (!polls || polls.length === 0) {
      return NextResponse.json([]);
    }

    // Get all options for these polls
    const pollIds = polls.map((poll) => poll.id);

    const { data: options, error: optionsError } = await supabase
      .from('trip_poll_options')
      .select('id, poll_id, text')
      .in('poll_id', pollIds);

    if (optionsError) {
      console.error('Error fetching poll options:', optionsError);
      return NextResponse.json({ error: 'Failed to fetch poll options' }, { status: 500 });
    }

    // Group options by poll ID
    const optionsByPoll =
      options?.reduce(
        (acc, option) => {
          if (!acc[option.poll_id]) {
            acc[option.poll_id] = [];
          }
          acc[option.poll_id].push(option);
          return acc;
        },
        {} as Record<number, any[]>
      ) || {};

    // Get votes for each option
    const { data: votes, error: votesError } = await supabase
      .from('trip_poll_votes')
      .select('id, poll_id, option_id, user_id')
      .in('poll_id', pollIds);

    if (votesError) {
      console.error('Error fetching poll votes:', votesError);
      return NextResponse.json({ error: 'Failed to fetch poll votes' }, { status: 500 });
    }

    // Count votes by option ID and check if user has voted
    const votesByOption =
      votes?.reduce(
        (acc, vote) => {
          if (!acc[vote.option_id]) {
            acc[vote.option_id] = { count: 0, voters: [] };
          }
          acc[vote.option_id].count += 1;
          acc[vote.option_id].voters.push(vote.user_id);
          return acc;
        },
        {} as Record<number, { count: number; voters: string[] }>
      ) || {};

    // Add options and vote information to each poll
    const enrichedPolls = polls.map((poll) => {
      const pollOptions = optionsByPoll[poll.id] || [];

      // Add vote counts and check user vote for each option
      const optionsWithVotes = pollOptions.map((option) => {
        const voteInfo = votesByOption[option.id] || { count: 0, voters: [] };
        return {
          ...option,
          votes: voteInfo.count,
          has_voted: voteInfo.voters.includes(userId),
        };
      });

      // Check if poll has expired
      const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;

      // Update is_active if expired
      const isActive = poll.is_active && !isExpired;

      return {
        ...poll,
        is_active: isActive,
        options: optionsWithVotes,
        user_has_voted: optionsWithVotes.some((opt) => opt.has_voted),
        total_votes: optionsWithVotes.reduce((sum, opt) => sum + opt.votes, 0),
      };
    });

    return NextResponse.json(enrichedPolls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
