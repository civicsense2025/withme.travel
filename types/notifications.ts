/**
 * Types for notifications and activity timeline features
 */

export type NotificationPriority = 'high' | 'medium' | 'low';
export type NotificationType =
  | 'system_message'
  | 'trip_update'
  | 'comment'
  | 'mention'
  | 'invite'
  | 'friend_request'
  | 'itinerary_change'
  | 'trip_update'
  | 'vote'
  | 'focus'
  | 'member_activity'
  | 'template_liked'
  | 'template_commented'
  | 'admin_alert';
export type ReferenceType = 'itinerary_item' | 'comment' | 'vote' | 'focus_session' | 'trip';

export type ActionType =
  | 'TRIP_CREATED'
  | 'TRIP_UPDATED'
  | 'ITINERARY_ITEM_ADDED'
  | 'ITINERARY_ITEM_UPDATED'
  | 'ITINERARY_ITEM_DELETED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_ROLE_UPDATED'
  | 'INVITATION_SENT'
  | 'ACCESS_REQUEST_SENT'
  | 'ACCESS_REQUEST_UPDATED'
  | 'NOTE_CREATED'
  | 'NOTE_UPDATED'
  | 'NOTE_DELETED'
  | 'IMAGE_UPLOADED'
  | 'TAG_ADDED'
  | 'TAG_REMOVED'
  | 'COMMENT_ADDED'
  | 'COMMENT_UPDATED'
  | 'COMMENT_DELETED'
  | 'VOTE_CAST'
  | 'FOCUS_INITIATED';

export interface NotificationSender {
  id?: string;
  name?: string;
  avatar_url?: string | null;
}

/**
 * Notification object as returned from the API or database
 */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  read_at?: string | null;
  read?: boolean;
  action_url?: string | null;
  metadata?: Record<string, any> | null;
  sender?: NotificationSender | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Archived notification in history
 */
export interface NotificationHistory extends Notification {
  archived_at: string;
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  digest_frequency: 'none' | 'daily' | 'weekly';
  muted_types: NotificationType[];
  quiet_hours: {
    enabled: boolean;
    start: string; // 24h format - "22:00"
    end: string; // 24h format - "07:00"
    timezone: string; // e.g. "America/New_York"
  };
  // Per-type toggles
  trip_updates: boolean;
  itinerary_changes: boolean;
  member_activity: boolean;
  comments: boolean;
  votes: boolean;
  focus_events: boolean;
  template_likes?: boolean;
  template_comments?: boolean;
  admin_alerts?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for creating a new notification
 */
export interface CreateNotificationParams {
  userId: string;
  title: string;
  content: string;
  notificationType?: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
  sender?: {
    id?: string;
    name?: string;
    avatar_url?: string | null;
  };
}

/**
 * Response from notification count API
 */
export interface NotificationCountResponse {
  unreadCount: number;
}

/**
 * Response from notifications list API
 */
export interface NotificationsListResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
}

/**
 * Parameters for notifications list API
 */
export interface NotificationsListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

/**
 * Parameters for marking notifications as read
 */
export interface MarkAsReadParams {
  notificationIds: string[];
  read: boolean;
}

/**
 * Parameters for archiving notifications
 */
export interface ArchiveNotificationsParams {
  notificationIds: string[];
  archiveAll?: boolean;
}

/**
 * Response from notification API operations
 */
export interface NotificationActionResponse {
  success: boolean;
  error?: string;
  count?: number;
}

export interface ActivityTimelineItem {
  id: string;
  trip_id: string;
  created_at: string;
  user_id: string;
  action_type: ActionType;
  details: Record<string, any>;
  actor_name: string | null;
  actor_avatar: string | null;
}

export interface FocusSession {
  id: string;
  trip_id: string;
  initiated_by: string;
  section_id: string;
  section_path: string;
  section_name: string;
  active: boolean;
  message?: string;
  created_at: string;
  expires_at: string;
  initiator?: {
    name: string | null;
    avatar_url: string | null;
  };
}

// Function types for context helpers
export type MarkNotificationReadFn = (notificationId: string) => Promise<void>;
export type MarkAllNotificationsReadFn = () => Promise<void>;
export type GetUnreadCountFn = () => Promise<number>;
export type StartFocusSessionFn = (
  sectionId: string,
  sectionPath: string,
  sectionName: string,
  message?: string
) => Promise<FocusSession | null>;
export type EndFocusSessionFn = (sessionId: string) => Promise<void>;

export type NotificationEvent =
  | 'trip_invitation'
  | 'member_joined'
  | 'member_left'
  | 'role_changed'
  | 'itinerary_major_update'
  | 'place_added'
  | 'comment_added'
  | 'comment_mention'
  | 'vote_created'
  | 'vote_completed'
  | 'trip_reminder'
  | 'deadline_reminder'
  | 'group_idea_added'
  | 'group_plan_created'
  | 'idea_vote'
  | 'idea_comment';

export interface NotificationConfig {
  type: NotificationEvent;
  priority: NotificationPriority;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  requiresAction: boolean;
  groupable: boolean;
  expiresAfterDays?: number;
}
