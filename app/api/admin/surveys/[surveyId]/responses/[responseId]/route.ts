import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { FORM_TABLES } from '@/utils/constants/tables';

/**
 * GET /api/admin/surveys/[surveyId]/responses/[responseId]
 * Fetch a specific survey response
 */
export async function GET(
  request: Request,
  { params }: { params: { surveyId: string; responseId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    const { surveyId, responseId } = params;

    if (!surveyId || !responseId) {
      return NextResponse.json(
        { error: 'Survey ID and Response ID are required' },
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

    // Get the survey details
    const { data: survey, error: surveyError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('id, name, description, config')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Get the response details
    const { data: response, error: responseError } = await supabase
      .from(FORM_TABLES.FORM_RESPONSES)
      .select('*, profiles:user_id(id, name, email, avatar_url)')
      .eq('id', responseId)
      .eq('form_id', surveyId)
      .single();

    if (responseError) {
      console.error('Error fetching response:', responseError);
      
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

    // Transform response to include user information
    const { profiles, ...restResponse } = response;
    
    // Combine survey fields with response data
    const fields = survey.config?.fields || [];
    
    return NextResponse.json({
      response: {
        ...restResponse,
        user: profiles,
      },
      survey: {
        id: survey.id,
        name: survey.name,
        description: survey.description,
        fields: fields
      }
    });
  } catch (error) {
    console.error('Error in single response API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
