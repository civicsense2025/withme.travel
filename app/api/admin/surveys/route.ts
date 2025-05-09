import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface SurveyDefinition {
  id: string;
  survey_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions: any;
}

/**
 * GET /api/admin/surveys
 * Fetch all survey definitions with response counts
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

    // Check if user is an admin (implement your admin check logic here)
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

    // Get all survey definitions
    const { data: surveys, error: surveysError } = await supabase
      .from('survey_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (surveysError) {
      console.error('Error fetching surveys:', surveysError);
      return NextResponse.json(
        { error: 'Failed to fetch surveys' },
        { status: 500 }
      );
    }

    // Get response counts for each survey
    const surveysWithCounts = await Promise.all(
      surveys.map(async (survey: SurveyDefinition) => {
        const { count, error: countError } = await supabase
          .from('survey_responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', survey.survey_id);

        if (countError) {
          console.error(`Error fetching response count for survey ${survey.survey_id}:`, countError);
        }

        return {
          ...survey,
          response_count: count || 0
        };
      })
    );

    return NextResponse.json({ surveys: surveysWithCounts });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 