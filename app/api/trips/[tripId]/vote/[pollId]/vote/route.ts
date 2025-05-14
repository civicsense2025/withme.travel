import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// Define FIELDS locally
const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  TRIP_VOTES: {
    POLL_ID: 'poll_id',
    OPTION_ID: 'option_id',
    USER_ID: 'user_id',
  },
  TRIP_VOTE_POLLS: {
    TITLE: 'title',
    IS_ACTIVE: 'is_active',
  },
  TRIP_VOTE_OPTIONS: {
    TITLE: 'title',
    DESCRIPTION: 'description',
    IMAGE_URL: 'image_url',
  },
};

// Schema for vote submission validation
const voteSchema = z.object({
  optionId: z.string().uuid('Option ID must be a valid UUID'),
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
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

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
      .from('trip_vote_polls')
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
      .from('trip_vote_options')
      .select('id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json({ error: 'Invalid option for this poll' }, { status: 400 });
    }

    // Check if user has already voted on this poll
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('trip_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    // If user has already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from('trip_votes')
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
    const { error: insertError } = await supabase.from('trip_votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
      trip_id: tripId,
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
