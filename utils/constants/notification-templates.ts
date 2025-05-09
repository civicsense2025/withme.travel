import type { NotificationType } from '@/types/notifications';

/**
 * Template function type for notification messages
 */
export type NotificationTemplateFn = (params: Record<string, any>) => { title: string; content: string };

/**
 * Centralized notification message templates for all NotificationTypes
 * Each template is a function that receives params and returns { title, content }
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplateFn> = {
  trip_update: ({ tripName }) => ({
    title: 'Trip Updated',
    content: tripName ? `Your trip "${tripName}" has been updated.` : 'A trip you are part of has been updated.',
  }),
  comment: ({ userName, itemTitle }) => ({
    title: 'New Comment',
    content: userName && itemTitle
      ? `${userName} commented on "${itemTitle}".`
      : 'You have a new comment.',
  }),
  mention: ({ userName, context }) => ({
    title: 'You were mentioned',
    content: userName && context
      ? `${userName} mentioned you in ${context}.`
      : 'You were mentioned.',
  }),
  invite: ({ tripName }) => ({
    title: 'Trip Invitation',
    content: tripName
      ? `You have been invited to join the trip "${tripName}".`
      : 'You have a new trip invitation.',
  }),
  friend_request: ({ userName }) => ({
    title: 'Friend Request',
    content: userName
      ? `${userName} sent you a friend request.`
      : 'You have a new friend request.',
  }),
  itinerary_change: ({ tripName }) => ({
    title: 'Itinerary Changed',
    content: tripName
      ? `The itinerary for "${tripName}" was updated.`
      : 'An itinerary you are part of was updated.',
  }),
  vote: ({ itemTitle }) => ({
    title: 'Vote Activity',
    content: itemTitle
      ? `There is new voting activity on "${itemTitle}".`
      : 'There is new voting activity.',
  }),
  focus: ({ sessionName }) => ({
    title: 'Focus Session Started',
    content: sessionName
      ? `A collaborative planning session "${sessionName}" has started.`
      : 'A collaborative planning session has started.',
  }),
  member_activity: ({ userName, action, tripName }) => ({
    title: 'Member Activity',
    content: userName && action && tripName
      ? `${userName} ${action} your trip "${tripName}".`
      : 'There was member activity in your trip.',
  }),
  template_liked: ({ templateTitle }) => ({
    title: 'Template Liked',
    content: templateTitle
      ? `Someone liked your template: "${templateTitle}".`
      : 'Someone liked your template.',
  }),
  template_commented: ({ templateTitle }) => ({
    title: 'New Comment on Template',
    content: templateTitle
      ? `Someone commented on your template: "${templateTitle}".`
      : 'Someone commented on your template.',
  }),
  admin_alert: ({ title, content }) => ({
    title: title || 'Admin Alert',
    content: content || 'You have a new admin alert.',
  }),
  system_message: ({ title, content }) => ({
    title: title || 'System Message',
    content: content || 'You have a new system message.',
  }),
  FRIEND_REQUEST_RECEIVED: {
    title: 'New Friend Request',
    body: '{senderName} sent you a friend request.',
  },
  FRIEND_REQUEST_ACCEPTED: {
    title: 'Friend Request Accepted',
    body: '{receiverName} accepted your friend request.',
  },
}; 