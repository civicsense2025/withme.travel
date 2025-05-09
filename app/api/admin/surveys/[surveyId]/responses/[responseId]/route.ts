import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    surveyId: string;
    responseId: string;
  };
}

/**
 * GET /api/admin/surveys/[surveyId]/responses/[responseId]
 * Fetch a specific survey response
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { surveyId, responseId } = params;
  
  if (!surveyId || !responseId) {
    return NextResponse.json(
      { error: 'Survey ID and Response ID are required' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createRouteHandlerClient();

    // Verify user is authenticated and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (adminCheckError || !adminCheck?.is_admin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Get the specific response
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('id', responseId)
      .eq('survey_id', surveyId)
      .single();

    if (responseError) {
      console.error('Error fetching survey response:', responseError);
      
      if (responseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Response not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/[surveyId]/responses/[responseId]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 