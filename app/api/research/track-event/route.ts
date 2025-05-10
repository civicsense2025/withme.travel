import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const { participantId, eventName, metadata } = await request.json();

    // Validate required fields
    if (!participantId || !eventName) {
      return NextResponse.json(
        { error: 'Missing required fields: participantId and eventName' },
        { status: 400 }
      );
    }

    // First verify the participant exists
    const { data: participant, error: participantError } = await supabase
      .from(TABLES.RESEARCH_PARTICIPANTS)
      .select('id, study_id')
      .eq('id', participantId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Invalid participant ID' },
        { status: 400 }
      );
    }

    // Insert the event
    const { data, error } = await supabase
      .from(TABLES.RESEARCH_EVENTS)
      .insert({
        participant_id: participantId,
        study_id: participant.study_id,
        event_name: eventName,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking research event:', error);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in research event tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 