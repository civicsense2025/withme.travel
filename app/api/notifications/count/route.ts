import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';

/**
 * GET route handler for fetching notification counts
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get count of unread notifications
    const { count, error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select('*', { count: 'exact', head: true })
      .eq(FIELDS.NOTIFICATIONS.USER_ID, user.id)
      .eq(FIELDS.NOTIFICATIONS.READ, false);

    if (error) {
      console.error('Error fetching notification count:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Unexpected error in notifications/count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
