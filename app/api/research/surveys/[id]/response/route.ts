import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
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
      .from(TABLES.SURVEY_DEFINITIONS)
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
      .from(TABLES.SURVEY_RESPONSES)
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