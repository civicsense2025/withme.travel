import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * API route for collecting custom performance metrics
 * POST /api/analytics/custom-metric
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get auth session to identify the user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Get analytics data from request
    const analyticsData = await request.json();

    if (!analyticsData.name) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    // Insert into analytics events table
    const { error } = await supabase.from('analytics_events').insert({
      user_id: userId || null,
      event_name: analyticsData.name,
      event_category: analyticsData.category || 'uncategorized',
      properties: analyticsData.properties || {},
      page_url: analyticsData.properties?.pathname || null,
      session_id: request.cookies.get('analytics_session_id')?.value || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving analytics event:', error);
      return NextResponse.json({ error: 'Failed to save analytics event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error processing analytics event:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Options GET request handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
