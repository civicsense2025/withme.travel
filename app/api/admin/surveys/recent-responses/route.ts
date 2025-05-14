import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES, FORM_TABLES } from '@/utils/constants/tables';

// Define the formatted response we want to return
interface FormattedResponse {
  id: string;
  form_id: string;
  user_id: string | null;
  status: string | null;
  data: any;
  created_at: string;
  updated_at: string | null;
  form_name: string;
}

/**
 * GET /api/admin/surveys/recent-responses
 * Fetch recent form responses for the admin dashboard
 */
export async function GET() {
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

    // Fetch recent form responses with form details
    const { data: responses, error: responsesError } = await supabase
      .from(FORM_TABLES.FORM_RESPONSES)
      .select(`
        *,
        form:${FORM_TABLES.FORMS}(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (responsesError) {
      console.error('Error fetching recent responses:', responsesError);
      return NextResponse.json({ error: 'Failed to fetch recent responses' }, { status: 500 });
    }

    // Format responses for the frontend
    const formattedResponses: FormattedResponse[] = responses.map((response) => ({
      id: response.id,
      form_id: response.form_id,
      user_id: response.user_id,
      status: response.status,
      data: response.data,
      created_at: response.created_at,
      updated_at: response.updated_at,
      form_name: response.form?.name || 'Unknown Form'
    }));

    return NextResponse.json({ responses: formattedResponses });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/recent-responses:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
