import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { v4 as uuidv4 } from 'uuid';
import { ResearchStudy, ResearchTrigger, SurveyQuestion } from '@/types/research';
import { 
  researchStudiesTable, 
  researchTriggersTable, 
  surveyDefinitionsTable 
} from '@/utils/supabase/table-helpers';

export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  // Check admin permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: profile } = await supabase
    .from(TABLES.PROFILES)
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Create study
  const body = await request.json();
  const { name, description, questions } = body;
  
  // Provide sample questions if none are supplied
  const sampleQuestions: SurveyQuestion[] = [
    {
      id: '1',
      text: 'How easy was it to complete this action?',
      type: 'rating',
      required: true,
      min: 1,
      max: 5
    },
    {
      id: '2',
      text: 'What did you like most about this feature?',
      type: 'text',
      required: false
    },
    {
      id: '3',
      text: 'Did you encounter any difficulties?',
      type: 'text',
      required: false
    }
  ];
  const questionsToInsert = Array.isArray(questions) && questions.length > 0 ? questions : sampleQuestions;
  
  try {
    // Create the research study
    const { data: studyData, error: studyError } = await researchStudiesTable(supabase)
      .insert({
        name,
        description,
        active: true
      } as Partial<ResearchStudy>)
      .select('*')
      .single();
      
    if (studyError || !studyData) {
      return NextResponse.json({ error: studyError?.message || 'Failed to create study' }, { status: 500 });
    }
    
    const study = studyData;
    
    // Create a unique survey ID for survey_definitions
    const surveyId = `research_${study.id.split('-')[0]}`;
    
    // Create survey in survey_definitions table
    const { data: surveyData, error: surveyError } = await surveyDefinitionsTable(supabase)
      .insert({
        survey_id: surveyId,
        title: `${name} Survey`,
        description: description,
        questions: questionsToInsert,
        is_active: true
      })
      .select()
      .single();
      
    if (surveyError || !surveyData) {
      // Delete the study if survey creation fails
      await researchStudiesTable(supabase)
        .delete()
        .eq('id', study.id);
        
      return NextResponse.json({ error: surveyError?.message || 'Failed to create survey' }, { status: 500 });
    }
    
    // Create triggers
    const triggers: Partial<ResearchTrigger>[] = [
      {
        study_id: study.id,
        trigger_event: 'trip_created',
        survey_id: surveyId, // Use the survey_id, not the UUID of the survey
        min_delay_ms: 2000, // 2 seconds
        max_triggers: 1,
        active: true
      },
      {
        study_id: study.id,
        trigger_event: 'itinerary_item_added',
        survey_id: surveyId,
        min_delay_ms: 2000,
        max_triggers: 1,
        active: true
      }
    ];
    
    // Create the research triggers
    const { error: triggerError } = await researchTriggersTable(supabase)
      .insert(triggers);
      
    if (triggerError) {
      return NextResponse.json({ error: triggerError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      id: study.id,
      surveyId: surveyId,
      message: 'Research study created successfully'
    });
  } catch (error) {
    console.error('Error creating research study:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    
    // Get the research study
    const { data: studyData, error } = await researchStudiesTable(supabase)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !studyData) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(studyData);
  } catch (error) {
    console.error('Error fetching research study:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, description, active } = body;
    
    // Update the research study
    const { data: studyData, error } = await researchStudiesTable(supabase)
      .update({ 
        name, 
        description, 
        active 
      } as Partial<ResearchStudy>)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error || !studyData) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 });
    }
    
    return NextResponse.json({ ...studyData });
  } catch (error) {
    console.error('Error updating research study:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 