/**
 * Types for notifications and activity timeline features
 */

export type NotificationPriority = 'high' | 'normal' | 'low';
export type NotificationType =
  | 'itinerary_change'
  | 'trip_update'
  | 'comment'
  | 'vote'
  | 'focus'
  | 'member_activity';
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

export interface Notification {
  id: string;
  user_id: string;
  trip_id: string;
  sender_id: string | null;
  title: string;
  content: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  action_url?: string;
  reference_id?: string;
  reference_type?: ReferenceType;
  created_at: string;
  expires_at?: string;
  sender?: {
    name: string | null;
    avatar_url: string | null;
  };
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  trip_updates: boolean;
  itinerary_changes: boolean;
  member_activity: boolean;
  comments: boolean;
  votes: boolean;
  focus_events: boolean;
  created_at: string;
  updated_at: string;
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
