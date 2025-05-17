import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TIME_FORMATS, THEME } from '@/utils/constants/ui';
import { format as formatFns, parseISO } from 'date-fns';

/**
 * Utility for conditionally joining CSS class names
 * Uses clsx for conditional class names and tailwind-merge for merging Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date range with start and end times
 */
export function formatDateRange(startStr?: string, endStr?: string) {
  if (!startStr && !endStr) return '';
  if (startStr && !endStr) return 'From ' + startStr;
  if (!startStr && endStr) return 'Until ' + endStr;
  if (startStr && endStr) {
    return startStr + ' - ' + endStr;
  }
  return 'Invalid date range';
}

/**
 * Format a date using consistent time formats from constants
 * @param date - Date string or Date object to format
 * @param format - Optional format type from TIME_FORMATS
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | undefined | null,
  formatType: keyof typeof TIME_FORMATS = 'DISPLAY_DATE'
): string {
  if (!date) return 'Unscheduled';

  let dateObj: Date;
  try {
    dateObj = typeof date === 'string' ? parseISO(date) : date;
    // Check if the date is valid after parsing/initialization
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }
  } catch (e) {
    console.error('Error parsing date in formatDate:', e);
    return 'Invalid Date';
  }

  // Use date-fns format for more control and reliability
  switch (formatType) {
    case 'DISPLAY_DATE':
      return formatFns(dateObj, 'MMM d, yyyy');
    case 'DISPLAY_TIME':
      return formatFns(dateObj, 'h:mm a');
    case 'FULL_DATE':
      return formatFns(dateObj, 'EEEE, MMMM d, yyyy');
    case 'SHORT_DATE':
      return formatFns(dateObj, 'MMM d');
    default:
      return formatFns(dateObj, 'P'); // Default to locale-aware date format
  }
}

/**
 * Truncate a string to a specified length
 * @param str The string to truncate
 * @param length The maximum length
 * @returns Truncated string
 */
export function truncate(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

// List of common stop words
const stopWords = new Set([
  'a',
  'an',
  'and',
  'the',
  'in',
  'on',
  'at',
  'for',
  'to',
  'of',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'mine',
  'yours',
  'hers',
  'ours',
  'theirs',
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'being',
  'been',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'will',
  'would',
  'shall',
  'should',
  'can',
  'could',
  'may',
  'might',
  'must',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'any',
  'around',
  'as',
  'because',
  'before',
  'below',
  'between',
  'both',
  'but',
  'by',
  'down',
  'during',
  'each',
  'few',
  'from',
  'further',
  'here',
  'how',
  'into',
  'if',
  'just',
  'more',
  'most',
  'no',
  'nor',
  'not',
  'only',
  'or',
  'other',
  'out',
  'over',
  'same',
  'so',
  'some',
  'still',
  'such',
  'than',
  'that',
  'then',
  'there',
  'these',
  'this',
  'those',
  'through',
  'under',
  'until',
  'up',
  'very',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'with',
  'within',
  'without',
  // Add more as needed
]);

/**
 * Generates a URL-friendly slug from a string.
 * Converts to lowercase, removes stop words, replaces spaces and invalid chars with hyphens,
 * and removes leading/trailing/duplicate hyphens.
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  // 1. Convert to lowercase
  let slug = text.toLowerCase();

  // 2. Remove stop words (split, filter, join)
  slug = slug
    .split(' ')
    .filter((word) => !stopWords.has(word))
    .join(' ');

  // 3. Replace spaces and non-alphanumeric characters (except hyphens) with a hyphen
  slug = slug
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove invalid characters

  // 4. Remove duplicate hyphens
  slug = slug.replace(/-{2,}/g, '-');

  // 5. Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Format a time string (HH:MM) to a readable format
 * @param timeStr Time string in HH:MM format or undefined
 * @returns Formatted time string in 12-hour format with AM/PM
 */
export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':');
    return new Date(0, 0, 0, Number.parseInt(hours), Number.parseInt(minutes)).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }
    );
  } catch (e) {
    return timeStr;
  }
}

/**
 * Format a currency amount with the appropriate symbol and locale formatting
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | undefined,
  currency: string = 'USD'
): string {
  if (amount === undefined || amount === null) {
    return '$0.00';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return '$0.00';
  }

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(numericAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '$' + numericAmount.toFixed(2);
  }
}

/**
 * Extract a human-readable error message from various error types
 * @param error Error object of any type
 * @param fallback Fallback message if no specific error can be extracted
 * @returns Human-readable error message
 */
export function formatError(
  error: unknown,
  fallback: string = 'An unexpected error occurred'
): string {
  if (!error) return fallback;

  // Handle string errors
  if (typeof error === 'string') return error;

  // Handle Error objects
  if (error instanceof Error) return error.message || fallback;

  // Handle Supabase-style errors with data.error or error property
  if (typeof error === 'object') {
    const errorObj = error as Record<string, any>;

    // Check for data.error pattern
    if (errorObj.data && errorObj.data.error) {
      return errorObj.data.error;
    }

    // Check for error or message property
    if (errorObj.error) {
      return typeof errorObj.error === 'string'
        ? errorObj.error
        : errorObj.error.message || fallback;
    }

    if (errorObj.message) {
      return errorObj.message;
    }
  }

  return fallback;
}

/**
 * Get the initials from a name (first letter of first and last name)
 * @param name Name to extract initials from
 * @returns 1-2 character string of initials
 */
export function getInitials(name?: string | null): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // Get first letter of first name and first letter of last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Limit an array of items to a specified size and return info about hidden items
 * @param items Array of items to limit
 * @param limit Maximum number of items to return
 * @returns Object with limited items and metadata about hidden items
 */
export function limitItems<T>(
  items: T[],
  limit: number = 10
): {
  items: T[];
  hiddenCount: number;
  hasMore: boolean;
} {
  if (!items || !Array.isArray(items)) {
    return { items: [], hiddenCount: 0, hasMore: false };
  }

  if (items.length <= limit) {
    return { items, hiddenCount: 0, hasMore: false };
  }

  return {
    items: items.slice(0, limit),
    hiddenCount: items.length - limit,
    hasMore: true,
  };
}

/**
 * Generate a background color class based on an ID string
 * @param id String ID to use for color generation
 * @returns Tailwind background color class
 */
export function getColorClassFromId(id?: string): string {
  if (!id) return 'bg-gray-200';

  // Use a simple hash function to convert the ID to a number
  const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // List of color classes to choose from
  const colorClasses = [
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-red-100',
    'bg-purple-100',
    'bg-pink-100',
    'bg-indigo-100',
    'bg-orange-100',
    'bg-teal-100',
    'bg-cyan-100',
  ];

  // Use the hash to pick a color class
  return colorClasses[hash % colorClasses.length];
}

/**
 * Generate a consistent card style class
 * @returns CSS class for card styling
 */
export function getCardClass(): string {
  return 'bg-background dark:bg-slate-900/60';
}

/**
 * Formats a date relative to the current time.
 * Example: "2 hours ago", "yesterday", "in 3 days"
 *
 * @param date The date to format (string or Date object)
 * @returns A string representing the relative time, or the formatted date if error.
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }

    const now = new Date();
    const diffSeconds = (now.getTime() - dateObj.getTime()) / 1000;
    const diffDays = Math.round(diffSeconds / (60 * 60 * 24));

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return Math.floor(diffSeconds / 60) + ' minutes ago';
    if (diffSeconds < 86400) return Math.floor(diffSeconds / 3600) + ' hours ago';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
    if (diffDays < 365) return Math.floor(diffDays / 30) + ' months ago';

    // For dates more than a year ago, return formatted date
    return formatDate(dateObj, 'DISPLAY_DATE');
  } catch (error) {
    console.error('Error formatting relative time:', error);
    // Fallback to standard date format if relative calculation fails
    return formatDate(date, 'DISPLAY_DATE');
  }
}
