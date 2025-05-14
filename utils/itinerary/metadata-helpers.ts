import { ItineraryTemplateMetadata } from '@/types/itinerary';

/**
 * Helper functions for working with itinerary template metadata
 */

/**
 * Merges new metadata with existing metadata, replacing only the fields that are provided
 * in the new metadata object.
 *
 * @param existingMetadata - The current metadata object (can be null/undefined)
 * @param newMetadata - The new metadata fields to merge in
 * @returns The merged metadata object
 */
export function mergeMetadata(
  existingMetadata: ItineraryTemplateMetadata | null | undefined,
  newMetadata: Partial<ItineraryTemplateMetadata>
): ItineraryTemplateMetadata {
  // Start with existing metadata or empty object
  const baseMetadata = existingMetadata || {};

  // Return merged object, with new values overriding existing ones
  return {
    ...baseMetadata,
    ...newMetadata,
  };
}

/**
 * Formats the budget for display
 *
 * @param metadata - The metadata object
 * @returns Formatted budget string
 */
export function getFormattedBudget(metadata: ItineraryTemplateMetadata | null | undefined): string {
  if (!metadata) return '';

  // Use the explicit budget field if available
  if (metadata.budget) {
    return metadata.budget;
  }

  // Otherwise try to construct from estimated daily budget
  if (metadata.estimated_budget_usd_per_day) {
    return `~$${metadata.estimated_budget_usd_per_day} per day`;
  }

  // Fall back to budget level if available
  if (metadata.budget_level) {
    const budgetMap: Record<string, string> = {
      budget: 'Budget-friendly',
      'mid-range': 'Mid-range',
      luxury: 'Luxury',
      'ultra-luxury': 'Ultra-luxury',
    };

    return budgetMap[metadata.budget_level.toLowerCase()] || metadata.budget_level;
  }

  return '';
}

/**
 * Gets the accessibility description from the level
 *
 * @param metadata - The metadata object
 * @returns Accessibility description
 */
export function getAccessibilityDescription(
  metadata: ItineraryTemplateMetadata | null | undefined
): string {
  if (!metadata?.accessibility_level) return '';

  // Map common level strings to more descriptive text
  const levelMap: Record<string, string> = {
    easy: 'Easy - suitable for all mobility levels',
    moderate: 'Moderate - some uneven terrain or stairs',
    difficult: 'Difficult - challenging terrain or many stairs',
    'very difficult': 'Very difficult - not wheelchair accessible',
  };

  // Return mapped description or the original if no mapping exists
  const level = metadata.accessibility_level.toLowerCase();
  return levelMap[level] || metadata.accessibility_level;
}

/**
 * Checks if metadata has enough content to display the metadata section
 *
 * @param metadata - The metadata object to check
 * @returns boolean indicating if there's enough content to display
 */
export function hasDisplayableMetadata(
  metadata: ItineraryTemplateMetadata | null | undefined
): boolean {
  if (!metadata) return false;

  // Define fields that make the metadata section worth showing
  const significantFields: (keyof ItineraryTemplateMetadata)[] = [
    'pace',
    'best_for',
    'languages',
    'local_tips',
    'best_seasons',
    'accessibility_level',
    'sustainability_aspects',
    'estimated_budget_usd_per_day',
  ];

  // Check if any significant field has a value
  return significantFields.some((field) => {
    const value = metadata[field];

    // For arrays, check if they have items
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    // For other types, check if they exist and aren't empty strings
    return value !== undefined && value !== null && value !== '';
  });
}
