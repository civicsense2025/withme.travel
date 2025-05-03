import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// Define table and field constants locally
const TRIP_MEMBERS_TABLE = 'trip_members';
const TRIP_MEMBERS_FIELDS = {
  TRIP_ID: 'trip_id',
  USER_ID: 'user_id',
};

// Schema for validating the incoming vote submission
const voteSubmissionSchema = z.object({
  pollId: z.string().uuid(),
  optionId: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const validation = voteSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { pollId, optionId } = validation.data;
    // Create Supabase client
    const supabase = createRouteHandlerClient();

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a member of this trip
    const { data: tripMember, error: memberError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('id')
      .eq(TRIP_MEMBERS_FIELDS.TRIP_ID, tripId)
      .eq(TRIP_MEMBERS_FIELDS.USER_ID, user.id)
      .single();

    if (memberError || !tripMember) {
      return NextResponse.json({ error: 'You are not a member of this trip' }, { status: 403 });
    }
    // Placeholder for database logic to record the vote
    console.log(`Vote received for Trip ${tripId}, Poll ${pollId}, Option ${optionId}`);

    // Return success response
    return NextResponse.json({ success: true, message: 'Vote submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit vote' }, { status: 500 });
  }
}
