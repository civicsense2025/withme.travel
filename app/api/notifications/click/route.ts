import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function POST(request: Request) {
  try {
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
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
    
    // Get the notification to verify ownership
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
    
    // 1. Mark the notification as read if it's not already
    if (!notification.read) {
      const { error: updateError } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({ read: true })
        .eq('id', notificationId);
        
      if (updateError) {
        console.error('Error marking notification as read:', updateError);
        // Continue execution - we still want to log the click even if update fails
      }
    }
    
    // 2. Log analytics data about the click
    const { error: analyticsError } = await supabase
      .from('notification_analytics')
      .insert({
        notification_id: notificationId,
        user_id: user.id,
        action: 'click',
        notification_type: notification.notification_type,
        reference_type: notification.reference_type,
        reference_id: notification.reference_id,
        device_info: request.headers.get('user-agent') || '',
      });
      
    if (analyticsError) {
      console.error('Error logging notification analytics:', analyticsError);
      // Non-critical error, so we'll still return success
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification click tracked successfully',
    });
  } catch (error) {
    console.error('Error processing notification click:', error);
    return NextResponse.json(
      { error: 'Failed to process notification click' },
      { status: 500 }
    );
  }
} 