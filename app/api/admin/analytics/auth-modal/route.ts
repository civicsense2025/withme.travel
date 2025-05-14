import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * POST handler for auth modal analytics
 * This endpoint receives analytics events from the auth modal and stores them in the database
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Get request data
    const data = await request.json();
    const { event, data: eventData } = data;

    // Validate inputs
    if (!event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    // Create Supabase client
    const supabase = await createRouteHandlerClient();

    // Authenticate user - only admins can read this data, but anyone can write
    const { data: userData } = await supabase.auth.getUser();

    // Timestamp the event
    const timestamp = new Date().toISOString();

    // Create table if it doesn't exist
    try {
      // Check if table exists
      const { count, error: checkError } = await supabase
        .from(TABLES.AUTH_MODAL_ANALYTICS)
        .select('*', { count: 'exact', head: true });

      // If we got a 400/404 error, table likely doesn't exist
      if (
        checkError &&
        (checkError.code === '42P01' ||
          checkError.message.includes(
            'relation "' + TABLES.AUTH_MODAL_ANALYTICS + '" does not exist'
          ))
      ) {
        console.log(
          'Auth modal analytics table does not exist. Data will be logged but not stored.'
        );
        // Just log the event but don't try to store it
        console.log('Auth modal event:', {
          event,
          eventData,
          userId: userData?.user?.id,
          timestamp,
        });
        return NextResponse.json({ success: true, message: 'Event logged' });
      }
    } catch (err) {
      // Table check failed, just log and continue
      console.warn('Failed to check ' + TABLES.AUTH_MODAL_ANALYTICS + ' table:', err);
    }

    // Try to store the analytics event
    try {
      const { error } = await supabase.from(TABLES.AUTH_MODAL_ANALYTICS).insert({
        event_name: event,
        event_data: eventData || {},
        user_id: userData?.user?.id || null, // Track the user if they're logged in
        timestamp,
        url: eventData?.path || null,
        ab_test_variant: eventData?.abTestVariant || 'control',
        context: eventData?.context || 'default',
      });

      if (error) {
        console.error('Error storing auth modal analytics:', error);
        // Log the event data since we couldn't store it
        console.log('Auth modal event data (not stored):', { event, eventData });
        return NextResponse.json({ success: true, message: 'Event logged but not stored' });
      }
    } catch (insertError) {
      console.error('Exception storing auth modal analytics:', insertError);
      // Log the event data since we couldn't store it
      console.log('Auth modal event data (not stored):', { event, eventData });
      return NextResponse.json({ success: true, message: 'Event logged but not stored' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth modal analytics error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing the analytics event' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for auth modal analytics
 * This endpoint returns analytics data for the admin dashboard
 * It's protected - only admins can access it
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
