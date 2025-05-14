import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Survey, SurveyQuestion } from '../../../../../types/research';
import { TABLES } from '@/utils/constants/tables';
import { FORM_TABLES } from '@/utils/constants/tables';
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
export async function GET(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    const surveyId = params.surveyId;

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    // Verify the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch the survey
    const { data: survey, error: surveyError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError) {
      console.error('Error fetching survey:', surveyError);
      return NextResponse.json(
        { error: 'Failed to fetch survey' },
        { status: 500 }
      );
    }

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Fetch response count
    const { count: responseCount, error: countError } = await supabase
      .from(FORM_TABLES.FORM_RESPONSES)
      .select('*', { count: 'exact', head: true })
      .eq('form_id', surveyId);

    if (countError) {
      console.error(`Error counting responses for survey ${surveyId}:`, countError);
    }

    // Return the survey with response count
    return NextResponse.json({
      survey: {
        ...survey,
        response_count: responseCount || 0
      }
    });
  } catch (error) {
    console.error('Error in survey detail API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/surveys/[surveyId]
 * Update a survey definition
 */
export async function PATCH(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  try {
    const surveyId = params.surveyId;
    const supabase = await createRouteHandlerClient();

    // Verify the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get update data from request body
    const updateData = await request.json();

    // Validate required fields
    if (!updateData.name) {
      return NextResponse.json(
        { error: 'Survey name is required' },
        { status: 400 }
      );
    }

    // Check if survey exists
    const { data: existingSurvey, error: checkError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('id')
      .eq('id', surveyId)
      .single();

    if (checkError || !existingSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Update the survey
    const { data: updatedSurvey, error: updateError } = await supabase
      .from(FORM_TABLES.FORMS)
      .update({
        name: updateData.name,
        description: updateData.description,
        config: updateData.config,
        is_active: updateData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', surveyId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating survey:', updateError);
      return NextResponse.json(
        { error: 'Failed to update survey' },
        { status: 500 }
      );
    }

    return NextResponse.json({ survey: updatedSurvey });
  } catch (error) {
    console.error('Error in survey update API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/surveys/[surveyId]
 * Delete a survey definition
 */
export async function DELETE(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  try {
    const surveyId = params.surveyId;
    const supabase = await createRouteHandlerClient();

    // Verify the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Check if survey exists
    const { data: existingSurvey, error: checkError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('id')
      .eq('id', surveyId)
      .single();

    if (checkError || !existingSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Delete the survey
    const { error: deleteError } = await supabase
      .from(FORM_TABLES.FORMS)
      .delete()
      .eq('id', surveyId);

    if (deleteError) {
      console.error('Error deleting survey:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete survey' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Survey deleted successfully' 
    });
  } catch (error) {
    console.error('Error in survey delete API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
