import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TIME_FORMATS, THEME } from '@/utils/constants/ui';
import { format as formatFns, parseISO } from 'date-fns';

/**
 * Combine multiple class names with clsx and twMerge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date range consistently
 * @param startDate Start date (string or Date)
 * @param endDate End date (string or Date)
 * @param format Format to use for each date
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate?: string | Date | null,
  endDate?: string | Date | null,
  format: keyof typeof TIME_FORMATS = 'DISPLAY_DATE'
): string {
  const startStr = startDate ? formatDate(startDate, format) : null;
  const endStr = endDate ? formatDate(endDate, format) : null;

  if (!startStr && !endStr) return 'Dates not set';
  if (startStr && !endStr) return `From ${startStr}`;
  if (!startStr && endStr) return `Until ${endStr}`;
  if (startStr && endStr) {
    return `${startStr} - ${endStr}`;
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
  return str.length > length ? `${str.substring(0, length)}...` : str;
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
 * Generate a consistent color class based on an ID
 * @param id The ID to use for generating the color
 * @returns CSS class for the color
 */
export function getColorClassFromId(id?: string): string {
  const colorClasses = [
    `bg-${THEME.COLORS.BLUE} text-blue-900`,
    `bg-${THEME.COLORS.PINK} text-pink-900`,
    `bg-${THEME.COLORS.YELLOW} text-amber-900`,
    `bg-${THEME.COLORS.PURPLE} text-purple-900`,
    `bg-${THEME.COLORS.MINT} text-emerald-900`,
    `bg-${THEME.COLORS.PEACH} text-orange-900`,
  ];

  if (!id) return colorClasses[0];

  const colorIndex =
    Math.abs(id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % colorClasses.length;
  return colorClasses[colorIndex];
}

/**
 * Generate a consistent card style class
 * @returns CSS class for card styling
 */
export function getCardClass(): string {
  return 'bg-background dark:bg-slate-900/60';
}

/**
 * Get initials from a name
 * @param name The name to get initials from
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name?: string | null): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .filter(char => char.match(/[A-Za-z]/)) // Only include letters
    .slice(0, 2) // Max 2 initials
    .join('')
    .toUpperCase();
}

/**
 * Format an error into a readable string
 * @param error Any error object or string
 * @param fallback Fallback message if error can't be parsed
 * @returns Formatted error message
 */
export function formatError(
  error: unknown,
  fallback: string = 'An unexpected error occurred'
): string {
  if (!error) return fallback;
  
  // If it's a string, return it directly
  if (typeof error === 'string') return error;
  
  // If it's an Error object with a message
  if (error instanceof Error) return error.message;
  
  // If it's an object with a message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  
  // If it's an object with an error property containing a message
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error: unknown }).error === 'object' &&
    (error as { error: unknown }).error !== null &&
    'message' in (error as { error: { message?: unknown } }).error
  ) {
    const msg = (error as { error: { message?: unknown } }).error.message;
    if (typeof msg === 'string') return msg;
  }
  
  // If it can be stringified, stringify it
  try {
    if (typeof error === 'object' && error !== null) {
      return JSON.stringify(error);
    }
  } catch (e) {
    // Ignore stringification errors
  }
  
  // Default fallback
  return fallback;
}

/**
 * Format a currency amount
 * @param amount The amount to format
 * @param currency The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | undefined,
  currency: string = 'USD'
): string {
  if (amount === undefined || amount === null) return '';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${numericAmount} ${currency}`;
  }
}

/**
 * Limit an array of items with info about hidden items
 * @param items Array of items to limit
 * @param limit Maximum number of items to return
 * @returns Object with limited items and info about hidden items
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
  
  // If items are less than or equal to the limit, return them all
  if (items.length <= limit) {
    return {
      items,
      hiddenCount: 0,
      hasMore: false,
    };
  }
  
  // Otherwise, return the limited items and info about hidden items
  return {
    items: items.slice(0, limit),
    hiddenCount: items.length - limit,
    hasMore: true,
  };
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
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    // For dates more than a year ago, return formatted date
    return formatDate(dateObj, 'DISPLAY_DATE');
  } catch (error) {
    console.error('Error formatting relative time:', error);
    // Fallback to standard date format if relative calculation fails
    return formatDate(date, 'DISPLAY_DATE');
  }
}
