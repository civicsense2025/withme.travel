import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/admin/surveys/create
 * Creates a new survey definition
 */
export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    // Verify user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (adminCheckError || !adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Parse the request body
    const body = await request.json();
    const { title, description, questions } = body;

    if (!title || !questions) {
      return NextResponse.json({ error: 'Title and questions are required' }, { status: 400 });
    }

    // Create a unique survey ID
    const surveyId = `survey_${uuidv4().substring(0, 8)}`;

    // Store the survey definition
    const { data: survey, error: surveyError } = await supabase
      .from('survey_definitions')
      .insert({
        survey_id: surveyId,
        title,
        description,
        questions,
        is_active: true,
      })
      .select()
      .single();

    if (surveyError) {
      console.error('Error creating survey:', surveyError);
      return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Survey created successfully',
      survey,
    });
  } catch (error) {
    console.error('Exception in POST /api/admin/surveys/create:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
