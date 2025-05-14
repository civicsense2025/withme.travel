import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';
import { FORM_TABLES } from '@/utils/constants/tables';

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
export async function GET(request: NextRequest, params: RouteParams) {
  const { surveyId, responseId } = params.params;

  if (!surveyId || !responseId) {
    return NextResponse.json({ error: 'Survey ID and Response ID are required' }, { status: 400 });
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

    // Get the form response
    const { data: response, error: responseError } = await supabase
      .from(FORM_TABLES.FORM_RESPONSES)
      .select('*')
      .eq('id', responseId)
      .eq('form_id', surveyId)
      .single();

    if (responseError) {
      console.error('Error fetching survey response:', responseError);

      if (responseError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Survey response not found' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Failed to fetch survey response' }, { status: 500 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/[surveyId]/responses/[responseId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
