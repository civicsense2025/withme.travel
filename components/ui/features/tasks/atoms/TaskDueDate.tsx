/**
 * TaskDueDate displays a formatted due date for tasks
 */

import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskDueDateProps {
  /** The date to display */
  date: string | Date;
  /** Whether to show the calendar icon */
  showIcon?: boolean;
  /** The format to display the date in */
  format?: 'short' | 'medium' | 'long';
  /** Whether to highlight if the date is past due */
  highlightOverdue?: boolean;
  /** Whether to show the badge background */
  showBadge?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component for displaying task due dates
 */
export function TaskDueDate({ 
  date, 
  showIcon = true, 
  format = 'short',
  highlightOverdue = true,
  showBadge = true,
  className = ''
}: TaskDueDateProps) {
  // Parse the date if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Check if date is in the past (overdue)
  const isOverdue = highlightOverdue && dateObj < now;
  
  // Format the date according to the specified format
  let formattedDate = '';
  switch (format) {
    case 'short':
      formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      break;
    case 'medium':
      formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      break;
    case 'long':
      formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      break;
  }

  if (showBadge) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs flex items-center gap-1",
          isOverdue && "text-red-600 border-red-200 dark:text-red-400 dark:border-red-900",
          className
        )}
      >
        {showIcon && <Calendar className="h-3 w-3" />}
        <span>{formattedDate}</span>
      </Badge>
    );
  }

  return (
    <span 
      className={cn(
        "text-xs flex items-center gap-1",
        isOverdue && "text-red-600 dark:text-red-400",
        className
      )}
    >
      {showIcon && <Calendar className="h-3 w-3" />}
      <span>{formattedDate}</span>
    </span>
  );
} 