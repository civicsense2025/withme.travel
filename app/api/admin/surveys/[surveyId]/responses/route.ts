import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    surveyId: string;
  };
}

/**
 * GET /api/admin/surveys/[surveyId]/responses
 * Fetch all responses for a specific survey
 */
export async function GET(request: NextRequest, params: RouteParams) {
  const surveyId = params.params.surveyId;
  
  if (!surveyId) {
    return NextResponse.json(
      { error: 'Survey ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createRouteHandlerClient();

    // Verify user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (adminCheckError || !adminCheck?.is_admin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Verify the survey exists
    const { data: survey, error: surveyError } = await supabase
      .from('survey_definitions')
      .select('id')
      .eq('survey_id', surveyId)
      .single();

    if (surveyError) {
      console.error('Error verifying survey:', surveyError);
      
      if (surveyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Survey not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to verify survey' },
        { status: 500 }
      );
    }

    // Get the survey responses
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('Error fetching survey responses:', responsesError);
      return NextResponse.json(
        { error: 'Failed to fetch survey responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/[surveyId]/responses:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 