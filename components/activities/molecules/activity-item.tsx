/**
 * Activity Item (Molecule)
 *
 * A complete activity entry that displays an icon, user information,
 * description, and timestamp.
 *
 * @module activities/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ActivityIcon, ActivityType } from '../atoms/activity-icon';
import { ActivityTimestamp } from '../atoms/activity-timestamp';
import { ActivityDescription } from '../atoms/activity-description';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ActivityItemProps {
  /** The type of activity */
  type: ActivityType;
  /** User who performed the activity */
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  /** When the activity occurred */
  timestamp: string | Date;
  /** Description of the activity */
  description: string;
  /** Entity the activity was performed on (optional) */
  entityName?: string;
  /** Additional details about the activity (optional) */
  details?: string;
  /** Whether to truncate the description */
  truncateDescription?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ActivityItem({
  type,
  user,
  timestamp,
  description,
  entityName,
  details,
  truncateDescription = false,
  className,
}: ActivityItemProps) {
  // Extract the user's initials for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn('flex items-start gap-3 p-3', className)}>
      {/* Activity Icon */}
      <div className="mt-1 flex-shrink-0 rounded-full bg-muted p-1.5">
        <ActivityIcon type={type} size={16} />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* User Avatar and Description */}
          <div className="flex items-start gap-2 min-w-0">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>

            <ActivityDescription
              description={description}
              userName={user.name}
              entityName={entityName}
              details={details}
              truncate={truncateDescription}
              maxLength={150}
            />
          </div>

          {/* Timestamp */}
          <ActivityTimestamp date={timestamp} className="flex-shrink-0 ml-auto" />
        </div>
      </div>
    </div>
  );
}
