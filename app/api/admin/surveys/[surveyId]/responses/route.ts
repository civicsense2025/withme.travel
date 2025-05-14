import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';

interface RouteParams {
  params: {
    surveyId: string;
  };
}

/**
 * GET /api/admin/surveys/[surveyId]/responses
 * Fetch all responses for a specific survey
 */
export async function GET(request: NextRequest, params: RouteParams): Promise<NextResponse> {
  const surveyId = params.params.surveyId;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '100'); // Default to 100 items per page

  if (!surveyId) {
    return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createRouteHandlerClient();

    // Verify user is authenticated and is an admin
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

    // Check if survey exists
    const { data: surveyExists, error: surveyCheckError } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .select('survey_id')
      .eq('survey_id', surveyId)
      .single();

    if (surveyCheckError && surveyCheckError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get the survey responses with pagination
    const {
      data: responses,
      error: responsesError,
      count,
    } = await supabase
      .from(TABLES.SURVEY_RESPONSES)
      .select('*', { count: 'exact' })
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (responsesError) {
      console.error('Error fetching survey responses:', responsesError);
      return NextResponse.json({ error: 'Failed to fetch survey responses' }, { status: 500 });
    }

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return NextResponse.json({
      responses,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: count,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/[surveyId]/responses:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
