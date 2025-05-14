/**
 * Destinations Components Module
 *
 * This index file centralizes all component exports from the destinations/components directory.
 * Using a barrel export pattern helps maintain cleaner imports in parent components
 * and provides a single point of entry for all component exports.
 *
 * Example import:
 * ```tsx
 * import { DestinationCard, SearchBar } from '@/app/destinations/components';
 * ```
 *
 * @module destinations/components
 */

// Component exports
export { default as DestinationCard } from './DestinationCard';
export { SearchBar } from './SearchBar';

// Re-export types from DestinationCard for external use
export type {
  DestinationCardProps,
  DestinationEventHandlers,
  DestinationClickHandler,
  DestinationKeyboardHandler,
} from './types';
