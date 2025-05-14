import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/surveys/count
 * Get the total count of survey responses for the admin dashboard
 */
export async function GET() {
  try {
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

    // Get all responses and count them
    const { data, error: countError } = await supabase.from('survey_responses').select('id');

    if (countError) {
      console.error('Error getting survey response count:', countError);
      return NextResponse.json({ error: 'Failed to get survey response count' }, { status: 500 });
    }

    // Count the responses
    const count = data ? data.length : 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Exception in GET /api/admin/surveys/count:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
