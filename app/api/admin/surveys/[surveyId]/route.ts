import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    surveyId: string;
  };
}

/**
 * GET /api/admin/surveys/[surveyId]
 * Fetch a specific survey definition
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

    // Verify user is authenticated and is an admin - use getUser instead of getSession
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

    // Get the survey definition
    const { data: survey, error: surveyError } = await supabase
      .from('survey_definitions')
      .select('*')
      .eq('survey_id', surveyId)
      .single();

    if (surveyError) {
      console.error('Error fetching survey:', surveyError);
      
      if (surveyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Survey not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch survey' },
        { status: 500 }
      );
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/[surveyId]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 