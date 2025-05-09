import { PAGE_ROUTES } from './constants/routes';
import type { NotificationType, ReferenceType, Notification, NotificationEvent } from '@/types/notifications';
import { ReadonlyURLSearchParams } from 'next/navigation';

export interface DeepLinkParams {
  tripId?: string;
  referenceId?: string;
  referenceType?: ReferenceType;
  sectionId?: string;
  highlight?: boolean;
  notificationId?: string;
}

export interface NotificationContext {
  notificationId?: string;
  highlight?: boolean;
  itemId?: string;
  commentId?: string;
  voteId?: string;
  focusId?: string;
}

/**
 * Creates a deep link URL for a notification
 * @param notificationType - The type of notification
 * @param params - Parameters needed for the deep link
 * @returns The formatted deep link URL
 */
export function createDeepLink(
  notificationType: NotificationType | NotificationEvent, 
  params: DeepLinkParams
): string {
  const { tripId, referenceId, referenceType, sectionId, highlight = true, notificationId } = params;
  
  // Add notification tracking parameter
  const searchParams = new URLSearchParams();
  
  if (notificationId) {
    searchParams.set('nid', notificationId);
  }
  
  if (highlight) {
    searchParams.set('highlight', 'true');
  }
  
  if (referenceId) {
    searchParams.set('refId', referenceId);
  }
  
  if (sectionId) {
    searchParams.set('section', sectionId);
  }
  
  let baseUrl: string;
  
  // Map notification types to paths
  switch (notificationType) {
    // Trip related notifications
    case 'trip_update':
    case 'itinerary_change': 
    case 'comment':
    case 'vote':
    case 'focus':
    case 'member_activity':
    case 'trip_invitation':
    case 'member_joined':
    case 'member_left':
    case 'role_changed':
    case 'itinerary_major_update':
    case 'place_added':
    case 'comment_added':
    case 'comment_mention':
    case 'vote_created':
    case 'vote_completed':
    case 'trip_reminder':
    case 'deadline_reminder':
      if (!tripId) throw new Error('Missing tripId parameter for this notification type');
      baseUrl = `${PAGE_ROUTES.TRIP_DETAILS(tripId)}`;
      break;
      
    // Group related notifications
    case 'group_idea_added':
    case 'group_plan_created':
    case 'idea_vote':
    case 'idea_comment':
      // Assuming we have group routes - if not, default to home
      baseUrl = '/groups'; // This should be updated when group routes are available
      break;
      
    // Default to notifications page
    default:
      baseUrl = '/notifications';
  }
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate a deep link from an existing notification object
 * @param notification - The notification object
 * @returns The formatted deep link URL
 */
export function getDeepLinkFromNotification(notification: Notification): string {
  // If notification already has an action URL, use it
  if (notification.action_url) {
    const url = new URL(notification.action_url, window.location.origin);
    
    // Add notification tracking info if not already present
    if (!url.searchParams.has('notification_id')) {
      url.searchParams.set('notification_id', notification.id);
    }
    
    return url.pathname + url.search;
  }
  
  // Otherwise, generate a new deep link
  return createDeepLink(
    notification.notification_type as NotificationType | NotificationEvent,
    {
      tripId: notification.trip_id || undefined,
      referenceId: notification.reference_id || undefined,
      referenceType: notification.reference_type as ReferenceType | undefined,
      notificationId: notification.id,
    }
  );
}

/**
 * Extract notification parameters from URL search params
 * @param searchParams - The URL search params
 * @returns The notification context object or null
 */
export function extractNotificationContext(
  searchParams: ReadonlyURLSearchParams
): NotificationContext | null {
  const notificationId = searchParams.get('nid');
  
  if (!notificationId) {
    return null;
  }
  
  return {
    notificationId,
    highlight: searchParams.get('highlight') === 'true',
    itemId: searchParams.get('refId'),
    commentId: searchParams.get('commentId'),
    voteId: searchParams.get('voteId'),
    focusId: searchParams.get('focusId')
  };
}

/**
 * Track a notification click by calling the API
 * @param notificationId - ID of the notification that was clicked
 */
export async function trackNotificationClick(notificationId: string): Promise<void> {
  if (!notificationId) return;
  
  try {
    await fetch('/api/notifications/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notificationId }),
    });
  } catch (error) {
    console.error('Failed to track notification click:', error);
  }
}

/**
 * Track a notification impression by calling the API
 * @param notificationId - ID of the notification that was viewed
 */
export async function trackNotificationImpression(notificationId: string): Promise<void> {
  if (!notificationId) return;
  
  try {
    await fetch('/api/notifications/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        notificationId,
        action: 'impression' 
      }),
    });
  } catch (error) {
    console.error('Failed to track notification impression:', error);
  }
} 