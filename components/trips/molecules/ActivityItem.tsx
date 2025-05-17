'use client';

import { cn } from '@/lib/utils';
import { ActivityIcon, ActivityType } from '../atoms/ActivityIcon';
import { TripDates } from '../atoms/TripDates';

/**
 * Props for the ActivityItem component
 */
export interface ActivityItemProps {
  /** Activity type (icon) */
  type: ActivityType;
  /** Activity title */
  title: string;
  /** Optional activity description */
  description?: string;
  /** Start date (ISO string) */
  startDate?: string | null;
  /** End date (ISO string) */
  endDate?: string | null;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional right-side action (e.g., button) */
  action?: React.ReactNode;
}

/**
 * Displays an activity item with icon, title, description, and dates
 */
export function ActivityItem({
  type,
  title,
  description,
  startDate,
  endDate,
  className,
  onClick,
  action,
}: ActivityItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View activity ${title}` : undefined}
    >
      <ActivityIcon type={type} size={28} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</div>
        )}
        {(startDate || endDate) && (
          <div className="text-xs text-gray-400 mt-0.5">
            <TripDates startDate={startDate || null} endDate={endDate || null} format="short" />
          </div>
        )}
      </div>
      {action && <div className="ml-2 flex-shrink-0">{action}</div>}
    </div>
  );
} 