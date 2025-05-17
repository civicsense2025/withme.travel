/**
 * Date Badge
 * 
 * Displays a formatted date in a badge with appropriate styling.
 */
import { format, isValid, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export interface DateBadgeProps {
  /**
   * Date to display (ISO string, Date object, or null)
   */
  date: string | Date | null | undefined;
  /**
   * Optional CSS class for the badge
   */
  className?: string;
  /**
   * Label for dates that are missing or invalid
   */
  nullDateLabel?: string;
  /**
   * Custom date format (date-fns format string)
   */
  dateFormat?: string;
  /**
   * Show the calendar icon
   */
  showIcon?: boolean;
  /**
   * Make the badge smaller
   */
  compact?: boolean;
  /**
   * Badge variant
   */
  variant?: 'default' | 'secondary' | 'outline';
}

/**
 * Displays a formatted date in a badge
 */
export function DateBadge({ 
  date, 
  className = '',
  nullDateLabel = 'Unscheduled',
  dateFormat = 'MMM d, yyyy',
  showIcon = true,
  compact = false,
  variant = 'secondary'
}: DateBadgeProps) {
  // Parse the date and check if it's valid
  let displayDate: string;
  let parsedDate: Date | null = null;
  
  if (!date) {
    displayDate = nullDateLabel;
  } else {
    // Parse string dates
    if (typeof date === 'string') {
      parsedDate = parseISO(date);
    } else {
      parsedDate = date;
    }
    
    // Format the date if valid
    if (parsedDate && isValid(parsedDate)) {
      displayDate = format(parsedDate, dateFormat);
    } else {
      displayDate = nullDateLabel;
    }
  }

  return (
    <Badge 
      variant={variant}
      className={`${className} ${compact ? 'text-xs py-0.5 px-2' : ''}`}
    >
      {showIcon && <Calendar className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-1 inline-block`} />}
      {displayDate}
    </Badge>
  );
} 