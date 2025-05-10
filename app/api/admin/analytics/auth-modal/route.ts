import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

/**
 * POST handler for auth modal analytics
 * This endpoint receives analytics events from the auth modal and stores them in the database
 */
export async function POST(request: Request) {
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
        .from('auth_modal_analytics')
        .select('*', { count: 'exact', head: true });
      
      // If we got a 400/404 error, table likely doesn't exist
      if (checkError && (checkError.code === '42P01' || checkError.message.includes('relation "auth_modal_analytics" does not exist'))) {
        console.log('Auth modal analytics table does not exist. Data will be logged but not stored.');
        // Just log the event but don't try to store it
        console.log('Auth modal event:', { event, eventData, userId: userData?.user?.id, timestamp });
        return NextResponse.json({ success: true, message: 'Event logged' });
      }
    } catch (err) {
      // Table check failed, just log and continue
      console.warn('Failed to check auth_modal_analytics table:', err);
    }
    
    // Try to store the analytics event
    try {
      const { error } = await supabase
        .from('auth_modal_analytics')
        .insert({
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
export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createRouteHandlerClient();

    // Authenticate user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profileData || profileData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if the analytics table exists
    try {
      const { count, error: checkError } = await supabase
        .from('auth_modal_analytics')
        .select('*', { count: 'exact', head: true });
      
      if (checkError && (checkError.code === '42P01' || checkError.message.includes('relation "auth_modal_analytics" does not exist'))) {
        // Table doesn't exist, return empty data
        return NextResponse.json({
          totalEvents: 0,
          eventCounts: {},
          contextCounts: {},
          variantCounts: {},
          contextByVariant: {},
          conversionByVariant: {
            'control': { opens: 0, successes: 0, rate: 0 },
            'variant-a': { opens: 0, successes: 0, rate: 0 },
            'variant-b': { opens: 0, successes: 0, rate: 0 },
          },
          timeRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
          }
        });
      }
    } catch (err) {
      console.warn('Failed to check auth_modal_analytics table:', err);
      // Continue anyway and let the next query fail if the table doesn't exist
    }

    // Fetch analytics data - last 30 days by default
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get aggregate metrics
    const { data: summaryData, error: summaryError } = await supabase
      .from('auth_modal_analytics')
      .select('event_name, context, ab_test_variant')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (summaryError) {
      console.error('Error fetching analytics data:', summaryError);
      
      if (summaryError.code === '42P01' || summaryError.message.includes('relation "auth_modal_analytics" does not exist')) {
        // Table doesn't exist, return empty data
        return NextResponse.json({
          totalEvents: 0,
          eventCounts: {},
          contextCounts: {},
          variantCounts: {},
          contextByVariant: {},
          conversionByVariant: {
            'control': { opens: 0, successes: 0, rate: 0 },
            'variant-a': { opens: 0, successes: 0, rate: 0 },
            'variant-b': { opens: 0, successes: 0, rate: 0 },
          },
          timeRange: {
            from: thirtyDaysAgo.toISOString(),
            to: new Date().toISOString(),
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Process data for the dashboard
    const eventCounts: Record<string, number> = {};
    const contextCounts: Record<string, number> = {};
    const variantCounts: Record<string, number> = {};
    const contextByVariant: Record<string, Record<string, number>> = {};

    // Define interface for analytics records
    interface AnalyticsRecord {
      event_name: string;
      context: string;
      ab_test_variant: string;
    }

    // Calculate conversion rates by context and variant
    const openEvents = summaryData.filter((item: AnalyticsRecord) => item.event_name === 'auth_modal_open');
    const successEvents = summaryData.filter((item: AnalyticsRecord) => item.event_name === 'auth_modal_login_success');

    // Count events by type, context and variant
    summaryData.forEach((item: AnalyticsRecord) => {
      // Count by event name
      eventCounts[item.event_name] = (eventCounts[item.event_name] || 0) + 1;
      
      // Count by context
      if (item.context) {
        contextCounts[item.context] = (contextCounts[item.context] || 0) + 1;
      }
      
      // Count by variant
      if (item.ab_test_variant) {
        variantCounts[item.ab_test_variant] = (variantCounts[item.ab_test_variant] || 0) + 1;
      }
      
      // Track context by variant combinations
      if (item.context && item.ab_test_variant) {
        if (!contextByVariant[item.ab_test_variant]) {
          contextByVariant[item.ab_test_variant] = {};
        }
        
        contextByVariant[item.ab_test_variant][item.context] = 
          (contextByVariant[item.ab_test_variant][item.context] || 0) + 1;
      }
    });

    // Calculate conversion rates by variant
    const conversionByVariant: Record<string, { opens: number; successes: number; rate: number }> = {};
    
    // Initialize with 0 values
    ['control', 'variant-a', 'variant-b'].forEach(variant => {
      conversionByVariant[variant] = { opens: 0, successes: 0, rate: 0 };
    });
    
    // Count opens by variant
    openEvents.forEach((item: AnalyticsRecord) => {
      if (item.ab_test_variant) {
        conversionByVariant[item.ab_test_variant].opens += 1;
      }
    });
    
    // Count successes by variant
    successEvents.forEach((item: AnalyticsRecord) => {
      if (item.ab_test_variant) {
        conversionByVariant[item.ab_test_variant].successes += 1;
      }
    });
    
    // Calculate rates
    Object.keys(conversionByVariant).forEach(variant => {
      const { opens, successes } = conversionByVariant[variant];
      conversionByVariant[variant].rate = opens > 0 ? (successes / opens) * 100 : 0;
    });

    // Return the processed analytics data
    return NextResponse.json({
      totalEvents: summaryData.length,
      eventCounts,
      contextCounts,
      variantCounts,
      contextByVariant,
      conversionByVariant,
      timeRange: {
        from: thirtyDaysAgo.toISOString(),
        to: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'An error occurred fetching the analytics data' },
      { status: 500 }
    );
  }
} 