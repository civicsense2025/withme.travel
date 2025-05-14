import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';
import { FORM_TABLES } from '@/utils/constants/tables';

interface RouteParams {
  params: {
    surveyId: string;
  };
}

/**
 * GET /api/admin/surveys/[surveyId]/responses
 * Fetch all responses for a specific survey
 */
export async function GET(
  request: Request,
  { params }: { params: { surveyId: string } }
): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    const surveyId = params.surveyId;
    const url = new URL(request.url);
    
    // Optional pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // Calculate offset
    const offset = (page - 1) * pageSize;

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

    // Check if survey exists
    const { data: survey, error: surveyError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('id, name')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Fetch responses with pagination
    const { data: responses, error: responsesError } = await supabase
      .from(FORM_TABLES.FORM_RESPONSES)
      .select('*, profiles:user_id(name, email, avatar_url)')
      .eq('form_id', surveyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from(FORM_TABLES.FORM_RESPONSES)
      .select('id', { count: 'exact', head: true })
      .eq('form_id', surveyId);

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    // Transform responses to include user information
    const transformedResponses = responses.map(response => {
      const { profiles, ...rest } = response;
      return {
        ...rest,
        user: profiles,
      };
    });

    // Return responses with pagination info
    return NextResponse.json({
      responses: transformedResponses,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      survey: {
        id: survey.id,
        name: survey.name
      }
    });
  } catch (error) {
    console.error('Error in survey responses API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
