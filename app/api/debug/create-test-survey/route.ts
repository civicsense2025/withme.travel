import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    // Check for admin role
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if study exists or create a new one
    const studyId =
      request.nextUrl.searchParams.get('studyId') || '00000000-0000-4000-a000-000000000001';

    const { data: existingStudy } = await supabase
      .from('research_studies')
      .select('id')
      .eq('id', studyId)
      .single();

    if (!existingStudy) {
      // Create a study
      await supabase.from('research_studies').insert({
        id: studyId,
        name: 'Test Study',
        description: 'This is a test study for debugging',
        active: true,
      });
    }

    // Create a test survey definition
    const surveyId = 'test_survey_' + Math.floor(Math.random() * 1000);

    await supabase.from('survey_definitions').insert({
      survey_id: surveyId,
      title: 'Test Survey',
      description: 'A survey for testing research triggers',
      is_active: true,
      questions: [
        {
          id: '1',
          text: 'How easy was it to use this feature?',
          type: 'rating',
          required: true,
        },
        {
          id: '2',
          text: 'What did you like most about it?',
          type: 'text',
          required: false,
        },
        {
          id: '3',
          text: 'How likely are you to recommend this to a friend?',
          type: 'likert',
          required: true,
        },
      ],
    });

    // Create a test trigger
    const testEvent = request.nextUrl.searchParams.get('event') || 'test_event';

    await supabase.from('research_triggers').insert({
      study_id: studyId,
      trigger_event: testEvent,
      survey_id: surveyId,
      min_delay_ms: 500,
      max_triggers: 10, // Allow multiple triggers for testing
      active: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Test survey and trigger created',
      studyId,
      surveyId,
      triggerEvent: testEvent,
      links: {
        debuggerPage: '/debug/research-debugger',
        researchLink: `/?research=true&pid=${uuidv4()}&sid=${studyId}`,
      },
    });
  } catch (error) {
    console.error('Error creating test survey:', error);
    return NextResponse.json(
      {
        error: 'Error creating test survey',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
