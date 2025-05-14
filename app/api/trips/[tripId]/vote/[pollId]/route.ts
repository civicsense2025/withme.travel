import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
// Direct table/field names used instead of imports
import { Database } from '@/types/database.types';
import { TABLES } from '@/utils/constants/tables';

type TripVoteOption = Database['public']['Tables']['trip_vote_options']['Row'];
type TripVotePollVote = {
  id: string;
  option_id: string;
  user_id: string;
  created_at: string;
  users?: any;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; pollId: string }> }
) {
  const { tripId, pollId } = await params;
  const supabase = await createRouteHandlerClient();

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
      .from(TABLES.TRIP_VOTE_POLLS)
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
      .from(TABLES.TRIP_VOTE_OPTIONS)
      .select('id, text')
      .eq('poll_id', pollId)
      .order('id', { ascending: true });

    if (optionsError) {
      console.error('Error fetching poll options:', optionsError);
      return NextResponse.json({ error: 'Failed to fetch poll options' }, { status: 500 });
    }

    // Fetch votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('trip_vote_polls')
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

    // After fetching options and votes:
    const safeOptions = (options as unknown as TripVoteOption[] | undefined)?.filter(
      (o): o is TripVoteOption => !!o && !('error' in o)
    );
    const safeVotes = (votes as unknown as TripVotePollVote[] | undefined)?.filter(
      (v): v is TripVotePollVote => !!v && !('error' in v)
    );

    // Get the user's current vote
    const userVote = safeVotes?.find((vote) => vote.user_id === userId);

    // Calculate results
    const results = safeOptions?.map((option) => {
      const optionVotes = safeVotes?.filter((vote) => vote.option_id === option.id) || [];
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
      options: safeOptions?.map((option) => ({ id: option.id, title: option.title })),
      results,
      userVote: userVote ? userVote.option_id : null,
      totalVotes: safeVotes?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching poll details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; pollId: string }> }
) {
  const { tripId, pollId } = await params;
  const supabase = await createRouteHandlerClient();
  // ... rest of DELETE handler ...
}
