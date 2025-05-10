import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  try {
    // Parse request body
    const body = await request.json();
    const { 
      participantId, 
      studyId, 
      surveyId, 
      triggerEvent, 
      answers 
    } = body;
    
    // Validate required fields
    if (!participantId || !studyId || !surveyId || !answers || !answers.length) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Check if participant exists
    const { data: participant, error: participantError } = await supabase
      .from(TABLES.RESEARCH_PARTICIPANTS)
      .select('*')
      .eq('id', participantId)
      .eq('study_id', studyId)
      .single();
      
    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' }, 
        { status: 404 }
      );
    }
    
    // Format answers into the expected format for survey_responses table
    const formattedResponses: Record<string, any> = {};
    answers.forEach((answer: { question_id: string; value: any }) => {
      formattedResponses[answer.question_id] = answer.value;
    });
    
    // Create survey response
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: surveyId,
        participant_id: participantId,
        study_id: studyId,
        trigger_event: triggerEvent,
        responses: formattedResponses,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        source: 'research_mode'
      })
      .select()
      .single();
      
    if (responseError) {
      console.error('Error submitting survey response:', responseError);
      return NextResponse.json(
        { error: 'Failed to submit survey response' }, 
        { status: 500 }
      );
    }
    
    // Record research event
    await supabase
      .from(TABLES.RESEARCH_EVENTS)
      .insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: 'survey_submitted',
        event_data: {
          survey_id: surveyId,
          response_id: response.id,
          trigger_event: triggerEvent
        }
      });
    
    // Update participant status to 'completed' if this was an exit survey
    if (triggerEvent === 'exit_survey') {
      await supabase
        .from(TABLES.RESEARCH_PARTICIPANTS)
        .update({ status: 'completed' })
        .eq('id', participantId);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Survey response submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 