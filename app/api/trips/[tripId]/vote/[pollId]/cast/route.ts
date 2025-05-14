import { createRouteHandlerClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/trips/[tripId]/vote/[pollId]/cast
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string; pollId: string } }
): Promise<NextResponse> {
  const { tripId, pollId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get vote data from request
    const { optionIds } = await request.json();

    if (!Array.isArray(optionIds) || optionIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid vote data: optionIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of this trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Check if poll exists and belongs to this trip
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, status, max_votes_per_user')
      .eq('id', pollId)
      .eq('trip_id', tripId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Check if poll is open
    if (poll.status !== 'open') {
      return NextResponse.json({ error: 'Poll is not open for voting' }, { status: 400 });
    }

    // Check if number of votes exceeds max allowed
    if (poll.max_votes_per_user && optionIds.length > poll.max_votes_per_user) {
      return NextResponse.json(
        {
          error: `Too many votes: maximum allowed is ${poll.max_votes_per_user}`,
        },
        { status: 400 }
      );
    }

    // Check if all options exist and belong to this poll
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('poll_id', pollId)
      .in('id', optionIds);

    if (optionsError) {
      throw new Error(`Failed to verify poll options: ${optionsError.message}`);
    }

    // If some options weren't found, they don't exist or don't belong to this poll
    if (!options || options.length !== optionIds.length) {
      return NextResponse.json({ error: 'One or more invalid option IDs' }, { status: 400 });
    }

    // First delete any existing votes by this user for this poll
    const { error: deleteError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`Failed to clear previous votes: ${deleteError.message}`);
    }

    // Insert the new votes
    const votes = optionIds.map((optionId) => ({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
    }));

    const { error: insertError } = await supabase.from('poll_votes').insert(votes);

    if (insertError) {
      throw new Error(`Failed to record votes: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Vote cast successfully',
      votes: optionIds.length,
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
