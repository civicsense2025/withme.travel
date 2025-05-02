import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating the incoming vote submission
const submitVoteSchema = z.object({
  pollId: z.number().int().positive(),
  optionId: z.number().int().positive(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  // Validate tripId
  if (!tripId || !/^\d+$/.test(tripId)) {
    return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
  }

  try {
    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = submitVoteSchema.parse(body);

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

    // Verify the poll belongs to this trip
    const { data: poll, error: pollError } = await supabase
      .from('trip_polls')
      .select('id, trip_id, expires_at')
      .eq('id', validatedData.pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Verify poll belongs to this trip
    if (poll.trip_id !== parseInt(tripId)) {
      return NextResponse.json({ error: 'Poll does not belong to this trip' }, { status: 403 });
    }

    // Check if poll has expired
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This poll has expired' }, { status: 400 });
    }

    // Verify the option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from('trip_poll_options')
      .select('id, poll_id')
      .eq('id', validatedData.optionId)
      .single();

    if (optionError || !option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    if (option.poll_id !== validatedData.pollId) {
      return NextResponse.json({ error: 'Option does not belong to this poll' }, { status: 400 });
    }

    // Check if user has already voted on this poll and delete previous vote if exists
    const { data: existingVote, error: existingVoteError } = await supabase
      .from('trip_poll_votes')
      .select('id')
      .eq('poll_id', validatedData.pollId)
      .eq('user_id', userId);

    if (existingVote && existingVote.length > 0) {
      // Delete previous votes
      await supabase
        .from('trip_poll_votes')
        .delete()
        .eq('poll_id', validatedData.pollId)
        .eq('user_id', userId);
    }

    // Submit the vote
    const { data: vote, error: voteError } = await supabase
      .from('trip_poll_votes')
      .insert({
        poll_id: validatedData.pollId,
        option_id: validatedData.optionId,
        user_id: userId,
      })
      .select('id')
      .single();

    if (voteError || !vote) {
      console.error('Error submitting vote:', voteError);
      return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
    }

    return NextResponse.json(
      { id: vote.id, message: 'Vote submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing vote submission:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
