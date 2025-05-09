import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function POST(request: Request) {
  try {
    const { notificationId, action = 'impression' } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // Validate action type
    if (!['impression', 'click', 'dismiss'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action type. Must be impression, click, or dismiss' },
        { status: 400 }
      );
    }
    
    const supabase = await createRouteHandlerClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the notification to verify ownership and get metadata
    const { data: notification, error: fetchError } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select('*')
      .eq('id', notificationId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching notification:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch notification' },
        { status: 500 }
      );
    }
    
    // Verify the notification belongs to the user
    if (!notification || notification.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Notification not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Log analytics data
    const { error: analyticsError } = await supabase
      .from('notification_analytics')
      .insert({
        notification_id: notificationId,
        user_id: user.id,
        action,
        notification_type: notification.notification_type,
        reference_type: notification.reference_type,
        reference_id: notification.reference_id,
        device_info: request.headers.get('user-agent') || '',
      });
      
    if (analyticsError) {
      console.error('Error logging notification analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to log analytics data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Notification ${action} tracked successfully`,
    });
  } catch (error) {
    console.error('Error processing notification analytics:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'week'; // 'day', 'week', 'month', 'all'
    
    const supabase = await createRouteHandlerClient();
    
    // Verify user is authenticated and has admin privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has admin rights
    const { data: profile, error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Only allow admins to access analytics
    if (profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Determine the timestamp range based on the specified period
    let timestampFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'day':
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        timestampFilter = `created_at >= '${dayStart.toISOString()}'`;
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        timestampFilter = `created_at >= '${weekStart.toISOString()}'`;
        break;
      case 'month':
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        timestampFilter = `created_at >= '${monthStart.toISOString()}'`;
        break;
      case 'all':
      default:
        // No filter
        timestampFilter = '';
    }
    
    // Prepare query for total counts
    let query = supabase.from('notification_analytics').select('*', { count: 'exact' });
    
    // Apply timestamp filter if specified
    if (timestampFilter) {
      query = query.filter('created_at', 'gte', timestampFilter);
    }
    
    // Fetch total counts
    const { count: totalCount, error: countError } = await query;
    
    if (countError) {
      console.error('Error fetching analytics count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }
    
    // Query for notification type breakdown
    let breakdownQuery = `
      SELECT notification_type, COUNT(*) as count
      FROM notification_analytics
    `;
    
    if (timestampFilter) {
      breakdownQuery += ` WHERE ${timestampFilter}`;
    }
    
    breakdownQuery += ` GROUP BY notification_type ORDER BY count DESC`;
    
    const { data: typeBreakdown, error: breakdownError } = await supabase.rpc(
      'execute_sql',
      { query: breakdownQuery }
    );
    
    if (breakdownError) {
      console.error('Error fetching type breakdown:', breakdownError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics breakdown' },
        { status: 500 }
      );
    }
    
    // Query for click-through rates (CTR)
    const ctrQuery = `
      WITH sent AS (
        SELECT notification_type, COUNT(*) as sent_count
        FROM notifications
        ${timestampFilter ? `WHERE ${timestampFilter}` : ''}
        GROUP BY notification_type
      ),
      clicked AS (
        SELECT notification_type, COUNT(*) as click_count
        FROM notification_analytics
        WHERE action = 'click'
        ${timestampFilter ? `AND ${timestampFilter}` : ''}
        GROUP BY notification_type
      )
      SELECT s.notification_type, 
             s.sent_count, 
             c.click_count,
             ROUND((c.click_count::float / s.sent_count) * 100, 2) as ctr
      FROM sent s
      LEFT JOIN clicked c ON s.notification_type = c.notification_type
      ORDER BY ctr DESC
    `;
    
    const { data: ctrData, error: ctrError } = await supabase.rpc(
      'execute_sql',
      { query: ctrQuery }
    );
    
    if (ctrError) {
      console.error('Error fetching CTR data:', ctrError);
      return NextResponse.json(
        { error: 'Failed to fetch CTR analytics' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      totalCount,
      period,
      typeBreakdown: typeBreakdown || [],
      clickThroughRates: ctrData || [],
    });
  } catch (error) {
    console.error('Error fetching notification analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 