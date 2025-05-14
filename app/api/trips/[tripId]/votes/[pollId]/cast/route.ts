import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string; pollId: string } }
) {
  const supabase = await createRouteHandlerClient();

  try {
    const { tripId, pollId } = params;

    if (!tripId || !pollId) {
      return NextResponse.json({ error: 'Trip ID and Poll ID are required' }, { status: 400 });
    }

    // Get request body
    const data = await request.json();
    const { optionId } = data;

    if (!optionId) {
      return NextResponse.json({ error: 'Option ID is required' }, { status: 400 });
    }

    // Check if poll exists and belongs to the trip
    const { data: poll, error: pollError } = await supabase
      .from(TABLES.TRIP_VOTE_POLLS)
      .select('*')
      .eq('id', pollId)
      .eq('trip_id', tripId)
      .single();

    if (pollError) {
      console.error('Error fetching poll:', pollError);
      return NextResponse.json({ error: 'Failed to find poll' }, { status: 500 });
    }

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if option exists and belongs to the poll
    const { data: option, error: optionError } = await supabase
      .from(TABLES.TRIP_VOTE_OPTIONS)
      .select('*')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single();

    if (optionError) {
      console.error('Error fetching option:', optionError);
      return NextResponse.json({ error: 'Failed to find option' }, { status: 500 });
    }

    // Check if user has already voted for this poll
    const { data: existingVote, error: voteCheckError } = await supabase
      .from(TABLES.TRIP_VOTES)
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single();

    // If user has already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from(TABLES.TRIP_VOTES)
        .update({
          option_id: optionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingVote.id);

      if (updateError) {
        console.error('Error updating vote:', updateError);
        return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Vote updated',
        voteId: existingVote.id,
      });
    }

    // If user has not voted yet, create a new vote
    const { data: newVote, error: createError } = await supabase
      .from(TABLES.TRIP_VOTES)
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
        trip_id: tripId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating vote:', createError);
      return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vote cast successfully',
      voteId: newVote.id,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
