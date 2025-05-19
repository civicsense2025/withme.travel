/**
 * ItineraryTimeDisplay
 *
 * Displays a formatted time for itinerary items
 *
 * @module itinerary/atoms
 */

'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for the ItineraryTimeDisplay component
 */
export interface ItineraryTimeDisplayProps {
  /** Start time as ISO string, Date object, or time string (HH:MM) */
  startTime?: string | Date | null;
  /** End time as ISO string, Date object, or time string (HH:MM) */
  endTime?: string | Date | null;
  /** Whether to display the clock icon */
  showIcon?: boolean;
  /** Additional class names for styling */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a formatted time for itinerary items
 */
export function ItineraryTimeDisplay({
  startTime,
  endTime,
  showIcon = true,
  className = '',
}: ItineraryTimeDisplayProps) {
  // Handle case when no times are provided
  if (!startTime && !endTime) {
    return null;
  }

  // Format the display text
  let displayText = '';
  
  if (startTime && !endTime) {
    displayText = `${formatTime(startTime)}`;
  } else if (!startTime && endTime) {
    displayText = `Until ${formatTime(endTime)}`;
  } else if (startTime && endTime) {
    displayText = `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  return (
    <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
      {showIcon && <Clock className="w-3.5 h-3.5 mr-1.5" />}
      <span>{displayText}</span>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format a time value to display format
 */
function formatTime(time: string | Date | null): string {
  if (!time) return '';
  
  try {
    let dateObj: Date;
    
    // If it's a Date object, use it directly
    if (time instanceof Date) {
      dateObj = time;
    }
    // If it's an ISO string, parse it with date-fns
    else if (typeof time === 'string' && time.includes('T')) {
      dateObj = parseISO(time);
    }
    // If it's a time string (HH:MM), create a date object
    else if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':').map(Number);
      dateObj = new Date();
      dateObj.setHours(hours);
      dateObj.setMinutes(minutes);
    }
    // Otherwise, return the original string
    else {
      return String(time);
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return String(time);
    }
    
    // Format using date-fns
    return format(dateObj, 'h:mm a'); // Returns "2:30 PM"
  } catch (e) {
    // Return original if any parsing fails
    return String(time);
  }
} 