import { format, formatDistance } from 'date-fns';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) return '';

  // For single words, return first letter
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  // For multiple words, return first letter of first and last words
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format a date range for display
 */
export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return 'No dates set';
  if (!endDate) return format(new Date(startDate), 'MMM d, yyyy');
  return `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), `MMM d, yyyy`)}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Format a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

/**
 * Format an error for display
 */
export function formatError(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error?.message && typeof error.message === 'string') return error.message;
  return 'An unknown error occurred';
}

/**
 * Generate a consistent color from an ID
 */
export function getColorClassFromId(id: string): string {
  const colorClasses = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800',
  ];

  // Simple hash function to generate a number from the ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Get positive value and select a color
  const index = Math.abs(hash) % colorClasses.length;
  return colorClasses[index];
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return fallback;
  }
}

/**
 * Wait for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Generate a random string ID
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function isEmptyObject(obj: any): boolean {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
}

/**
 * Format a currency value for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Limit the number of items in an array
 */
export function limitItems<T>(items: T[], limit: number = 5): T[] {
  if (!items) return [];
  return items.slice(0, limit);
}

/**
 * Formats a number to have commas for thousands
 */
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Truncates a string to the specified length with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Creates a slug from a string by removing special characters and replacing spaces with hyphens
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Creates a readable URL from a longer URL by removing protocol and trimming path
 */
export function formatUrl(url: string): string {
  if (!url) return '';

  try {
    // Remove protocol
    const withoutProtocol = url.replace(/^https?:\/\//, '');

    // Remove www if present
    const withoutWww = withoutProtocol.replace(/^www\./, '');

    // Truncate if too long
    return truncateString(withoutWww, 30);
  } catch (e) {
    return url;
  }
}

/**
 * Creates a random hexadecimal color
 */
export function randomColor(): string {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
}

export default {
  cn,
  getInitials,
  formatDateRange,
  formatDate,
  formatRelativeTime,
  formatError,
  getColorClassFromId,
  safeJsonParse,
  sleep,
  truncateText,
  generateId,
  isEmpty,
  isEmptyObject,
  formatCurrency,
  limitItems,
  formatNumber,
  truncateString,
  slugify,
  formatUrl,
  randomColor,
};
