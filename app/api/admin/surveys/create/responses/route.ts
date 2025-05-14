import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/surveys/create/responses
 * Gets all survey responses for a specific survey
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');

    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Verify user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (adminCheckError || !adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Get the survey responses
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('Error fetching survey responses:', responsesError);
      return NextResponse.json({ error: 'Failed to fetch survey responses' }, { status: 500 });
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/create/responses:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * POST /api/admin/surveys/create/responses
 * Submit a response to a survey
 */
export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get the authenticated user (can be null for anonymous responses)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Parse the request body
    const body = await request.json();
    const { surveyId, responses } = body;

    if (!surveyId || !responses) {
      return NextResponse.json({ error: 'Survey ID and responses are required' }, { status: 400 });
    }

    // Create the survey response
    const { data: surveyResponse, error: responseError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: surveyId,
        user_id: session?.user?.id || null,
        responses: responses,
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error creating survey response:', responseError);
      return NextResponse.json({ error: 'Failed to submit survey response' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Survey response submitted successfully',
      response: surveyResponse,
    });
  } catch (error) {
    console.error('Exception in POST /api/admin/surveys/create/responses:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
