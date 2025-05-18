import { ITINERARY_CATEGORIES } from './constants/status';

/**
 * Formats a category name for display
 *
 * @param category - The category string (can be null)
 * @returns Formatted category name
 */
export function formatCategoryName(category: string | null): string {
  if (!category) return '';

  // Check if it matches an itinerary category constant
  const matchedCategory = Object.values(ITINERARY_CATEGORIES).find(
    (cat) => cat.toLowerCase() === category.toLowerCase()
  );

  if (matchedCategory) {
    // Convert snake_case to Title Case
    return matchedCategory
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Otherwise, just return the original with first letter capitalized
  return category.charAt(0).toUpperCase() + category.slice(1);
}
