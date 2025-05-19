import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { recordCustomMetric } from '@/lib/api/analytics';

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
    const sessionId = request.cookies.get('analytics_session_id')?.value || undefined;

    if (!analyticsData.name) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const result = await recordCustomMetric(analyticsData, userId, sessionId);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
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
