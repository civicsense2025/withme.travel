/**
 * Itinerary Formatting Utilities
 * 
 * Helper functions for formatting and displaying itinerary data
 */

import { format, parseISO } from 'date-fns';
import type { ItineraryItem } from '@/types/itinerary';

/**
 * Format a time string (HH:MM:SS) to a user-friendly format (e.g., 2:30 PM)
 */
export function formatTime(timeString: string | null): string {
  if (!timeString) return '';
  
  try {
    // Create a dummy date to parse the time
    const date = new Date(`2000-01-01T${timeString}`);
    return format(date, 'h:mm a');
  } catch (e) {
    return timeString;
  }
}

/**
 * Format a date string (ISO) to a user-friendly format
 */
export function formatDate(dateString: string | null, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (e) {
    return dateString;
  }
}

/**
 * Get a time range display from start and end times
 */
export function getTimeDisplay(startTime: string | null, endTime: string | null): string {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  
  return start && end ? `${start} - ${end}` : start;
}

/**
 * Get the estimated duration in a readable format
 */
export function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

/**
 * Format cost with currency symbol
 */
export function formatCost(cost: number | null, currency: string | null = 'USD'): string {
  if (cost === null || cost === undefined) return '';
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    // Add more currencies as needed
  };
  
  const symbol = currency && currency in currencySymbols 
    ? currencySymbols[currency] 
    : currencySymbols.USD;
  
  return `${symbol}${cost.toFixed(2)}`;
} 