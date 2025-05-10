import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';

/**
 * GET handler for fetching triggers for a study
 * This endpoint returns all triggers for a given study
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    
    if (!studyId) {
      return NextResponse.json({ error: 'Study ID is required' }, { status: 400 });
    }
    
    // Create Supabase client
    const supabase = await createRouteHandlerClient();
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch triggers for the study
    const { data, error } = await supabase
      .from(TABLES.RESEARCH_TRIGGERS)
      .select(`
        id,
        study_id,
        trigger_event,
        survey_id,
        min_delay_ms,
        max_triggers,
        active
      `)
      .eq('study_id', studyId)
      .eq('active', true);
    
    if (error) {
      console.error('Error fetching triggers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch triggers' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ triggers: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for checking if an event should trigger a survey
 * This endpoint evaluates if an event should trigger a survey based on trigger rules
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, participantId, studyId } = body;
    
    if (!eventName || !participantId || !studyId) {
      return NextResponse.json(
        { error: 'Event name, participant ID, and study ID are required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = await createRouteHandlerClient();
    
    // Track the event
    const { error: eventError } = await supabase
      .from(TABLES.RESEARCH_EVENTS)
      .insert({
        participant_id: participantId,
        study_id: studyId,
        event_name: eventName,
      });
    
    if (eventError) {
      console.error('Error tracking event:', eventError);
      // Continue processing even if event tracking fails
    }
    
    // Find matching triggers
    const { data: triggers, error: triggerError } = await supabase
      .from(TABLES.RESEARCH_TRIGGERS)
      .select(`
        id,
        study_id,
        trigger_event,
        survey_id,
        min_delay_ms,
        max_triggers,
        active
      `)
      .eq('study_id', studyId)
      .eq('active', true);
    
    if (triggerError) {
      console.error('Error fetching triggers:', triggerError);
      return NextResponse.json(
        { error: 'Failed to fetch triggers' },
        { status: 500 }
      );
    }
    
    // Find matching trigger
    const matchingTrigger = triggers.find(trigger => 
      trigger.trigger_event.toLowerCase() === eventName.toLowerCase()
    );
    
    if (!matchingTrigger) {
      return NextResponse.json({ 
        shouldTrigger: false,
        trigger: null,
        message: 'No matching trigger found'
      });
    }
    
    // Count how many times this trigger has been shown to this participant
    const { count, error: countError } = await supabase
      .from(TABLES.SURVEY_RESPONSES)
      .select('*', { count: 'exact', head: true })
      .eq('participant_id', participantId)
      .eq('survey_id', matchingTrigger.survey_id)
      .eq('trigger_event', eventName);
    
    if (countError) {
      console.error('Error counting responses:', countError);
      return NextResponse.json(
        { error: 'Failed to check survey response count' },
        { status: 500 }
      );
    }
    
    const triggerCount = count || 0;
    
    // Check if we've reached the maximum number of triggers
    if (triggerCount >= matchingTrigger.max_triggers) {
      return NextResponse.json({ 
        shouldTrigger: false,
        trigger: matchingTrigger,
        message: 'Maximum trigger count reached'
      });
    }
    
    // Fetch the survey definition
    const { data: surveyData, error: surveyError } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .select('*')
      .eq('survey_id', matchingTrigger.survey_id)
      .single();
    
    if (surveyError) {
      console.error('Error fetching survey definition:', surveyError);
      return NextResponse.json(
        { error: 'Failed to fetch survey definition' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      shouldTrigger: true,
      trigger: matchingTrigger,
      survey: surveyData
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 