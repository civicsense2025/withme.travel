/**
 * Converts a string to a URL-friendly slug
 * @param text The string to convert to a slug
 * @returns The slugified string
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 * @param text The string to truncate
 * @param length The maximum length
 * @returns The truncated string
 */
export function truncate(text: string, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;

  return text.substring(0, length) + '...';
}

/**
 * Capitalizes the first letter of each word in a string
 * @param text The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';

  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a date string to a more readable format
 * @param dateString The date string to format
 * @param options Intl.DateTimeFormatOptions
 * @returns The formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats a category name for display by capitalizing and removing underscores
 * @param category The category string to format
 * @returns Formatted category name
 */
export function formatCategoryName(category: string | null): string {
  if (!category) return '';
  
  // Replace underscores with spaces and capitalize each word
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
