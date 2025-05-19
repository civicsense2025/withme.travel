/**
 * ActivityIcon component displays an icon for different activity types
 *
 * @module activities/atoms
 */

'use client';

import { 
  CalendarIcon, 
  MapPinIcon, 
  MessagesSquareIcon, 
  PencilIcon,
  UserIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon
} from 'lucide-react';

// Define activity types with their corresponding icons
export type ActivityType = 
  | 'trip_created'
  | 'trip_updated'
  | 'member_joined'
  | 'itinerary_added'
  | 'itinerary_updated'
  | 'comment_added'
  | 'task_completed'
  | 'note_added';

export interface ActivityIconProps {
  /** The type of activity to display an icon for */
  type: ActivityType;
  /** Additional CSS class names */
  className?: string;
  /** Size of the icon in pixels */
  size?: number;
}

/**
 * Displays an appropriate icon based on the activity type
 */
export function ActivityIcon({ type, className = '', size = 16 }: ActivityIconProps) {
  const iconProps = { 
    size, 
    className: `activity-icon ${className}`
  };

  switch (type) {
    case 'trip_created':
      return <CalendarIcon {...iconProps} />;
    case 'trip_updated':
      return <PencilIcon {...iconProps} />;
    case 'member_joined':
      return <UserIcon {...iconProps} />;
    case 'itinerary_added':
      return <MapPinIcon {...iconProps} />;
    case 'itinerary_updated':
      return <PencilIcon {...iconProps} />;
    case 'comment_added':
      return <MessagesSquareIcon {...iconProps} />;
    case 'task_completed':
      return <CheckIcon {...iconProps} />;
    case 'note_added':
      return <FileTextIcon {...iconProps} />;
    default:
      return <ClockIcon {...iconProps} />;
  }
}
