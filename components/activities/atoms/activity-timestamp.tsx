/**
 * ActivityTimestamp component formats and displays activity timestamps
 *
 * @module activities/atoms
 */

'use client';

import { formatDistanceToNow } from 'date-fns';

export interface ActivityTimestampProps {
  /** ISO date string or Date object */
  date: string | Date;
  /** Additional CSS class names */
  className?: string;
  /** Whether to show full date on hover */
  showFullDateOnHover?: boolean;
}

/**
 * Displays a relative timestamp (e.g., "2 hours ago") for an activity
 */
export function ActivityTimestamp({
  date,
  className = '',
  showFullDateOnHover = true
}: ActivityTimestampProps) {
  // Convert string date to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format as relative time
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });
  
  // Format as full date for tooltip
  const fullDate = dateObj.toLocaleString();
  
  return (
    <time 
      dateTime={dateObj.toISOString()}
      className={`text-muted-foreground text-sm ${className}`}
      title={showFullDateOnHover ? fullDate : undefined}
    >
      {relativeTime}
    </time>
  );
}
