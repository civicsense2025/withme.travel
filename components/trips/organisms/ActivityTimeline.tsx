'use client';

import { cn } from '@/lib/utils';
import { ActivityItem } from '../molecules/ActivityItem';
import type { ActivityItemProps } from '../molecules/ActivityItem';

/**
 * Props for the ActivityTimeline component
 */
export interface ActivityTimelineProps {
  /** List of activities */
  activities: ActivityItemProps[];
  /** Optional click handler for activity */
  onActivityClick?: (index: number) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Organism: Timeline of trip activities
 */
export function ActivityTimeline({
  activities,
  onActivityClick,
  className,
}: ActivityTimelineProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {activities.map((activity, idx) => (
        <ActivityItem
          key={idx}
          {...activity}
          onClick={onActivityClick ? () => onActivityClick(idx) : undefined}
        />
      ))}
    </div>
  );
} 