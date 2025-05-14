import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

interface RouteParams {
  params: {
    surveyId: string;
  };
}

/**
 * GET /api/admin/surveys/[surveyId]/preview
 *
 * Returns a survey definition for preview purposes.
 * This endpoint is designed for admin-only access.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const surveyId = params.surveyId;

    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
    }

    console.log(`Fetching survey ${surveyId} for preview`);

    const supabase = await createRouteHandlerClient();

    // Check if the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the survey definition
    const { data: survey, error: surveyError } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .select('*')
      .eq(surveyId.includes('-') ? 'id' : 'survey_id', surveyId)
      .single();

    if (surveyError) {
      console.error('Error fetching survey:', surveyError);
      return NextResponse.json(
        { error: surveyError.message },
        { status: surveyError.code === 'PGRST116' ? 404 : 500 }
      );
    }

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // Add additional information for preview if needed
    return NextResponse.json({
      survey: {
        ...survey,
        preview_mode: true,
        preview_accessed_at: new Date().toISOString(),
        preview_accessed_by: user.id,
      },
    });
  } catch (error) {
    console.error('Error in survey preview endpoint:', error);
    return NextResponse.json({ error: 'Failed to fetch survey for preview' }, { status: 500 });
  }
}
