/**
 * TaskBadge displays the status or priority of a task
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ExtendedItemStatus, TaskPriority } from '../types';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskBadgeProps {
  /** The type of badge to display */
  type: 'status' | 'priority';
  /** The value to display in the badge */
  value: ExtendedItemStatus | TaskPriority | string;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get appropriate status badge color based on status
 */
export function getStatusColor(status: ExtendedItemStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'suggested':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'active':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

/**
 * Get appropriate priority indicator color
 */
export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * A badge component for displaying task status or priority
 */
export function TaskBadge({ type, value, className = '' }: TaskBadgeProps) {
  let badgeClasses = '';
  
  if (type === 'status' && Object.values<string>({ 'confirmed': '', 'suggested': '', 'rejected': '', 'active': '', 'cancelled': '' }).includes(value)) {
    badgeClasses = getStatusColor(value as ExtendedItemStatus);
  } else if (type === 'priority' && Object.values<string>({ 'high': '', 'medium': '', 'low': '' }).includes(value)) {
    badgeClasses = getPriorityColor(value as TaskPriority);
  }
  
  return (
    <Badge className={cn(badgeClasses, className)}>
      {typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value}
    </Badge>
  );
} 