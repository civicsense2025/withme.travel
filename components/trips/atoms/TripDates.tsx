'use client';

import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * Props for the TripDates component
 */
export interface TripDatesProps {
  /** Start date of the trip (ISO string) */
  startDate: string | null;
  /** End date of the trip (ISO string) */
  endDate: string | null;
  /** Format to display dates */
  format?: 'short' | 'medium' | 'long';
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show duration in days */
  showDuration?: boolean;
  /** Whether to show month names */
  showMonth?: boolean;
  /** Whether to show year */
  showYear?: boolean;
  /** Separator between dates */
  separator?: string;
}

/**
 * Component for displaying trip dates with consistent formatting
 */
export function TripDates({
  startDate,
  endDate,
  format: displayFormat = 'medium',
  className,
  showDuration = false,
  showMonth = true,
  showYear = true,
  separator = ' - '
}: TripDatesProps) {
  // If no dates are provided, return a placeholder or null
  if (!startDate && !endDate) {
    return <span className={cn('text-gray-400', className)}>Dates not set</span>;
  }

  // Set date format based on the displayFormat prop
  let dateFormat = 'MMM d';
  if (displayFormat === 'short') {
    dateFormat = 'M/d';
  } else if (displayFormat === 'long') {
    dateFormat = 'MMMM d';
  }

  // Add year to format if showYear is true
  if (showYear) {
    dateFormat += ', yyyy';
  }

  // If only showMonth is false, remove month from format
  if (!showMonth) {
    dateFormat = dateFormat.replace(/M+\s/, '');
  }

  // Format start date
  const formattedStartDate = startDate 
    ? format(parseISO(startDate), dateFormat)
    : 'TBD';

  // Format end date
  const formattedEndDate = endDate 
    ? format(parseISO(endDate), dateFormat)
    : 'TBD';

  // Calculate duration if both dates are provided and showDuration is true
  let durationText = '';
  if (showDuration && startDate && endDate) {
    const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1; // +1 to include both start and end dates
    durationText = ` (${days} ${days === 1 ? 'day' : 'days'})`;
  }

  return (
    <span className={className}>
      {formattedStartDate}
      {separator}
      {formattedEndDate}
      {durationText}
    </span>
  );
} 