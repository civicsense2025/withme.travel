import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, TABLE_NAMES } from '@/utils/constants/tables';
import { z } from 'zod';

// Schema for validating response data
const SurveyResponseSchema = z.object({
  session_id: z.string().optional(),
  milestone: z.string().optional(),
  source: z.string().optional(),
  responses: z.record(z.string(), z.any()),
  user_id: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/research/surveys/[id]/response
 * Submit a response to a survey
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id;
    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Verify the survey exists
    const { data: survey, error: surveyError } = await supabase
      .from(TABLES.FORMS)
      .select('id, is_active')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      console.error('Survey not found:', surveyError);
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Check if survey is active
    if (survey.is_active === false) {
      return NextResponse.json(
        { error: 'Survey is not active' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    let validatedData;
    
    try {
      validatedData = SurveyResponseSchema.parse(body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid response data' },
        { status: 400 }
      );
    }

    // Get user ID if authenticated
    let userId = validatedData.user_id;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    // Generate a session ID if not provided
    const sessionId = validatedData.session_id || crypto.randomUUID();

    // Insert the response
    const { data: responseData, error: responseError } = await supabase
      .from(TABLE_NAMES.SURVEY_RESPONSES)
      .insert({
        survey_id: surveyId,
        session_id: sessionId,
        user_id: userId,
        responses: validatedData.responses,
        milestone: validatedData.milestone,
        source: validatedData.source,
        metadata: validatedData.metadata || {},
      })
      .select('id, created_at')
      .single();

    if (responseError) {
      console.error('Error saving survey response:', responseError);
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response_id: responseData.id,
      session_id: sessionId,
      timestamp: responseData.created_at,
    });
  } catch (error) {
    console.error('Unhandled error in survey response API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/research/surveys/[id]/response?response_id=...
 * Update a partial response (answers, milestone, etc)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id;
    const responseId = request.nextUrl.searchParams.get('response_id');
    if (!surveyId || !responseId) {
      return NextResponse.json(
        { error: 'Survey ID and response_id are required' },
        { status: 400 }
      );
    }
    const supabase = await createRouteHandlerClient();
    const body = await request.json();
    let validatedData;
    try {
      validatedData = SurveyResponseSchema.partial().parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid response data' },
        { status: 400 }
      );
    }
    // Update the response
    const { data, error } = await supabase
      .from(TABLE_NAMES.SURVEY_RESPONSES)
      .update({ ...validatedData })
      .eq('id', responseId)
      .eq('survey_id', surveyId)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update response', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ response: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/surveys/[id]/response?response_id=...
 * Fetch a partial response by id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id;
    const responseId = request.nextUrl.searchParams.get('response_id');
    if (!surveyId || !responseId) {
      return NextResponse.json(
        { error: 'Survey ID and response_id are required' },
        { status: 400 }
      );
    }
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.SURVEY_RESPONSES)
      .select('*')
      .eq('id', responseId)
      .eq('survey_id', surveyId)
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: 'Response not found', details: error?.message },
        { status: 404 }
      );
    }
    return NextResponse.json({ response: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 