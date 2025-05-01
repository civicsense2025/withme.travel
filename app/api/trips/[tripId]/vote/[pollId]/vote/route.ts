import { createApiClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for vote submission validation
const voteSchema = z.object({
  optionId: z.number().positive('Option ID must be positive'),
});

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
    // Parse and validate request body
    const body = await request.json();
    const validationResult = voteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { optionId } = validationResult.data;

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

    // Verify the poll exists and belongs to this trip
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

    // Verify the option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from('trip_poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json({ error: 'Invalid option for this poll' }, { status: 400 });
    }

    // Check if user has already voted on this poll
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('trip_poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    // If user has already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from('trip_poll_votes')
        .update({ option_id: optionId, voted_at: new Date().toISOString() })
        .eq('id', existingVote.id);

      if (updateError) {
        console.error('Error updating vote:', updateError);
        return NextResponse.json({ error: 'Failed to update your vote' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Your vote has been updated',
        optionId,
      });
    }

    // If user hasn't voted yet, create a new vote
    const { error: insertError } = await supabase.from('trip_poll_votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
      voted_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error creating vote:', insertError);
      return NextResponse.json({ error: 'Failed to cast your vote' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Your vote has been recorded',
      optionId,
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
