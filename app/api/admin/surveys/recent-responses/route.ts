import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Define the formatted response we want to return
interface FormattedResponse {
  id: string;
  survey_id: string;
  name: string | null;
  email: string | null;
  completed_at: string | null;
  source: string | null;
  created_at: string;
  survey_title: string;
}

/**
 * GET /api/admin/surveys/recent-responses
 * Fetch recent survey responses for the admin dashboard
 */
export async function GET() {
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

    // Get recent responses with survey information
    const { data, error: responsesError } = await supabase
      .from('survey_responses')
      .select(`
        id,
        survey_id,
        name,
        email,
        completed_at,
        source,
        created_at,
        survey_definitions:survey_definitions(title)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (responsesError) {
      console.error('Error fetching recent responses:', responsesError);
      return NextResponse.json(
        { error: 'Failed to fetch recent responses' },
        { status: 500 }
      );
    }

    // Transform the data to flatten the structure
    const formattedResponses: FormattedResponse[] = [];
    
    if (data) {
      for (const item of data) {
        // Type assertion to help TypeScript understand the structure
        const surveyTitle = item.survey_definitions && 
                           typeof item.survey_definitions === 'object' && 
                           'title' in item.survey_definitions ? 
                           (item.survey_definitions as any).title : 
                           'Unknown Survey';
                           
        formattedResponses.push({
          id: item.id,
          survey_id: item.survey_id,
          name: item.name,
          email: item.email,
          completed_at: item.completed_at,
          source: item.source,
          created_at: item.created_at,
          survey_title: surveyTitle
        });
      }
    }

    return NextResponse.json({ responses: formattedResponses });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/recent-responses:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 