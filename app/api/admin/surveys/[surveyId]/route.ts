import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Survey, SurveyQuestion } from '../../../../../types/research';
import { TABLES } from '@/utils/constants/tables';
// NOTE: All survey_definitions logic is commented out because the table was removed from the schema.
// import { TABLES } from '@/utils/constants/tables';

interface RouteParams {
  params: {
    surveyId: string;
  };
}

const SurveyQuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  text: z.string(),
  description: z.string().optional(),
  required: z.boolean(),
  // Add more fields as needed for each question type
});

const SurveySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(SurveyQuestionSchema),
});

/**
 * GET /api/admin/surveys/[surveyId]
 * Fetch a specific survey definition
 */
export async function GET(request: NextRequest, params: RouteParams): Promise<NextResponse> {
  const surveyId = params.params.surveyId;

  if (!surveyId) {
    return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createRouteHandlerClient();

    // Verify user is authenticated and is an admin - use getUser instead of getSession
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from(TABLES.PROFILES)
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (adminCheckError || !adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Get the survey definition
    // .from(TABLES.SURVEY_DEFINITIONS) // Table removed from schema
    const { data: survey, error: surveyError } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .select('*')
      .eq('survey_id', surveyId)
      .single();

    if (surveyError) {
      console.error('Error fetching survey:', surveyError);

      if (surveyError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/[surveyId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/surveys/[surveyId]
 * Update a survey definition
 */
export async function PATCH(request: NextRequest, params: RouteParams): Promise<NextResponse> {
  const surveyId = params.params.surveyId;
  if (!surveyId) {
    return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
  }
  let body: Partial<Survey>;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parseResult = SurveySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from(TABLES.PROFILES)
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (adminCheckError || !adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    // Update the survey definition
    const { error: updateError } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .update({
        title: body.title,
        description: body.description,
        questions: body.questions ? JSON.stringify(body.questions) : undefined,
      })
      .eq('survey_id', surveyId);
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update survey', details: updateError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/surveys/[surveyId]
 * Delete a survey definition
 */
export async function DELETE(request: NextRequest, params: RouteParams): Promise<NextResponse> {
  const surveyId = params.params.surveyId;
  if (!surveyId) {
    return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
  }
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from(TABLES.PROFILES)
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (adminCheckError || !adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    // Delete the survey definition
    const { error: deleteError } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .delete()
      .eq('survey_id', surveyId);
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete survey', details: deleteError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
