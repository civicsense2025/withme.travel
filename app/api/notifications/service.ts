import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { 
  Notification, 
  NotificationType,
  NotificationPriority,
  CreateNotificationParams,
  NotificationActionResponse
} from '@/types/notifications';
import { NOTIFICATION_TEMPLATES } from '@/utils/constants/notification-templates';

// Add NOTIFICATION_HISTORY to TABLES if it doesn't exist
const EXTENDED_TABLES = {
  ...TABLES,
  NOTIFICATION_HISTORY: 'notification_history'
};

// Helper to fetch user notification preferences
async function getUserNotificationPreferences(userId: string) {
  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data;
}

// Helper to check if a notification should be sent
function shouldSendNotification(type: NotificationType, prefs: any): boolean {
  if (type === 'system_message') return true; // Always send system messages
  if (!prefs) return true; // If no prefs, default to send
  if (prefs.muted_types && prefs.muted_types.includes(type)) return false;
  // Respect per-type toggles if present
  switch (type) {
    case 'trip_update': return !!prefs.trip_updates;
    case 'itinerary_change': return !!prefs.itinerary_changes;
    case 'member_activity': return !!prefs.member_activity;
    case 'comment': return !!prefs.comments;
    case 'vote': return !!prefs.votes;
    case 'focus': return !!prefs.focus_events;
    default: return true;
  }
}

/**
 * Creates a new notification for a user
 * Can be used in server components, API routes, and server actions
 */
export async function createNotification(options: CreateNotificationParams & { params?: Record<string, any> }): Promise<NotificationActionResponse> {
  const {
    userId,
    notificationType = 'system_message',
    params = {},
    title,
    content,
    priority = 'medium',
    actionUrl,
    metadata,
    sender,
  } = options;

  // Use centralized template
  let templateTitle = title;
  let templateContent = content;
  const templateFn = NOTIFICATION_TEMPLATES[notificationType];
  if (templateFn) {
    const tpl = templateFn({ ...params, title, content });
    templateTitle = templateTitle || tpl.title;
    templateContent = templateContent || tpl.content;
  }

  // Defensive fallback
  if (!templateTitle) templateTitle = 'Notification';
  if (!templateContent) templateContent = '';

  const prefs = await getUserNotificationPreferences(userId);
  if (!shouldSendNotification(notificationType, prefs)) {
    return { success: true, count: 0 };
  }
  
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: templateTitle,
        content: templateContent,
        notification_type: notificationType,
        priority,
        action_url: actionUrl,
        metadata,
        sender,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, count: 1 };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Creates notifications for multiple users
 * Useful for sending the same notification to a group
 */
export async function createGroupNotification(
  userIds: string[],
  options: Omit<CreateNotificationParams, 'userId'>
): Promise<NotificationActionResponse> {
  if (!userIds.length) return { success: true, count: 0 };
  
  try {
    const supabase = await createRouteHandlerClient();
    
    let count = 0;
    for (const userId of userIds) {
      const prefs = await getUserNotificationPreferences(userId);
      if (!shouldSendNotification(options.notificationType || 'system_message', prefs)) continue;
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          notification_type: options.notificationType || 'system_message',
          title: options.title,
          content: options.content,
          priority: options.priority || 'medium',
          action_url: options.actionUrl,
          metadata: options.metadata,
          sender: options.sender,
          read: false,
        });
      if (!error) count++;
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error in createGroupNotification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Marks notifications as read
 */
export async function markNotificationsAsRead(
  notificationIds: string[]
): Promise<NotificationActionResponse> {
  if (!notificationIds.length) return { success: true, count: 0 };
  
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', notificationIds)
      .select('id');
    
    if (error) {
      console.error('Error marking notifications as read:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, count: data.length };
  } catch (error) {
    console.error('Error in markNotificationsAsRead:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Archives notifications (moves them to history)
 */
export async function archiveNotifications(
  notificationIds: string[]
): Promise<NotificationActionResponse> {
  if (!notificationIds.length) return { success: true, count: 0 };
  
  try {
    const supabase = await createRouteHandlerClient();
    
    // First, get the notifications to move
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .in('id', notificationIds);
    
    if (fetchError || !notifications) {
      console.error('Error fetching notifications to archive:', fetchError);
      return { 
        success: false, 
        error: fetchError ? fetchError.message : 'Failed to fetch notifications' 
      };
    }
    
    // Move them to the history table
    const { error: insertError } = await supabase
      .from('notification_history')
      .insert(
        notifications.map((notification: Notification) => ({
          ...notification,
          archived_at: new Date().toISOString(),
        }))
      );
    
    if (insertError) {
      console.error('Error inserting into notification history:', insertError);
      return { success: false, error: insertError.message };
    }
    
    // Delete from the main table
    const { data, error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .in('id', notificationIds)
      .select('id');
    
    if (deleteError) {
      console.error('Error deleting archived notifications:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    return { success: true, count: data.length };
  } catch (error) {
    console.error('Error in archiveNotifications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// TODO: In the future, add role-based notification logic (e.g., notify template creators, admins, etc.) 