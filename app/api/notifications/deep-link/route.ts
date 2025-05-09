import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { createDeepLink } from '@/utils/notification-deeplinks';
import type { NotificationType, ReferenceType } from '@/types/notifications';

export async function POST(request: Request) {
  try {
    const {
      notificationType,
      tripId,
      referenceId,
      referenceType,
      sectionId,
      highlight,
      notificationId,
    } = await request.json();
    
    if (!notificationType) {
      return NextResponse.json(
        { error: 'Notification type is required' },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Optional: Verify permissions if tripId is provided
    if (tripId) {
      const { data: membership, error: membershipError } = await supabase
        .from(TABLES.TRIP_MEMBERS)
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Not authorized to access this trip' },
          { status: 403 }
        );
      }
    }
    
    // Create the deep link URL
    try {
      const deepLink = createDeepLink(
        notificationType as NotificationType,
        {
          tripId,
          referenceId,
          referenceType: referenceType as ReferenceType,
          sectionId,
          highlight,
          notificationId,
        }
      );
      
      return NextResponse.json({
        url: deepLink
      });
    } catch (deepLinkError) {
      console.error('Error creating deep link:', deepLinkError);
      return NextResponse.json(
        { error: 'Failed to generate deep link', details: (deepLinkError as Error).message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing deep link request:', error);
    return NextResponse.json(
      { error: 'Failed to process deep link request' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const notificationId = url.searchParams.get('notification_id');
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the notification data
    const { data: notification, error: fetchError } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select('*')
      .eq('id', notificationId)
      .eq('user_id', user.id)  // Ensure notification belongs to the user
      .single();
      
    if (fetchError || !notification) {
      console.error('Error fetching notification:', fetchError);
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // If the notification already has an action_url, return it
    if (notification.action_url) {
      return NextResponse.json({
        url: notification.action_url
      });
    }
    
    // Otherwise, generate a deep link based on notification properties
    try {
      const deepLink = createDeepLink(
        notification.notification_type as NotificationType,
        {
          tripId: notification.trip_id || undefined,
          referenceId: notification.reference_id || undefined,
          referenceType: notification.reference_type as ReferenceType || undefined,
          notificationId,
        }
      );
      
      return NextResponse.json({
        url: deepLink
      });
    } catch (deepLinkError) {
      console.error('Error creating deep link from notification:', deepLinkError);
      return NextResponse.json(
        { error: 'Failed to generate deep link', details: (deepLinkError as Error).message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing notification deep link request:', error);
    return NextResponse.json(
      { error: 'Failed to process deep link request' },
      { status: 500 }
    );
  }
} 