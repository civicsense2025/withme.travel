'use client';

import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Formats a date as a human-readable time ago string
 * (e.g. "2 minutes ago", "3 hours ago", "2 days ago")
 */
export function timeAgo(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  try {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date with a smart format:
 * - Today: "Today at 10:30 AM"
 * - Yesterday: "Yesterday at 10:30 AM"
 * - This year: "Feb 3 at 10:30 AM"
 * - Other years: "Feb 3, 2022 at 10:30 AM"
 */
export function smartDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  try {
    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    } else if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'h:mm a')}`;
    } else if (dateObj.getFullYear() === new Date().getFullYear()) {
      return format(dateObj, 'MMM d at h:mm a');
    } else {
      return format(dateObj, 'MMM d, yyyy at h:mm a');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date as a short date string (e.g. "Feb 3" or "Feb 3, 2022")
 */
export function formatShortDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  try {
    if (dateObj.getFullYear() === new Date().getFullYear()) {
      return format(dateObj, 'MMM d');
    } else {
      return format(dateObj, 'MMM d, yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date as a time string (e.g. "10:30 AM")
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  try {
    return format(dateObj, 'h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date range as 'May 16 to May 20' or 'May 28 to June 2'
 */
export function formatDateRange(from: Date | string | null, to: Date | string | null): string {
  if (!from && !to) return '';
  if (from && !to) return formatShortDate(from);
  if (!from && to) return formatShortDate(to);
  try {
    const fromDate = typeof from === 'string' ? new Date(from) : from;
    const toDate = typeof to === 'string' ? new Date(to) : to;
    if (!fromDate || !toDate) return '';
    if (fromDate.getFullYear() === toDate.getFullYear()) {
      if (fromDate.getMonth() === toDate.getMonth()) {
        // Same month/year
        return `${format(fromDate, 'MMM d')} to ${format(toDate, 'd, yyyy')}`;
      } else {
        // Same year, different months
        return `${format(fromDate, 'MMM d')} to ${format(toDate, 'MMM d, yyyy')}`;
      }
    } else {
      // Different years
      return `${format(fromDate, 'MMM d, yyyy')} to ${format(toDate, 'MMM d, yyyy')}`;
    }
  } catch (error) {
    console.error('Error formatting date range:', error);
    return '';
  }
}

/**
 * Format a date or timestamp into a human-readable time-ago format
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHrs < 24) {
    return `${diffHrs}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    // For older dates, return a more readable format
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }
}
