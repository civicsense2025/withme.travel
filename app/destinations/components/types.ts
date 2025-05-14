/**
 * Type definitions for destination components
 *
 * This file contains shared type definitions used by multiple components
 * in the destinations directory. Centralizing these types helps maintain
 * consistency and makes refactoring easier.
 *
 * @example
 * ```tsx
 * import { DestinationCardProps } from './types';
 *
 * function MyComponent({ destination }: DestinationCardProps) {
 *   // Component implementation
 * }
 * ```
 */

import { Destination } from '../constants';
import { MouseEventHandler, KeyboardEventHandler } from 'react';

/**
 * Event handler type for destination click events
 */
export type DestinationClickHandler = () => void;

/**
 * Event handler type for destination keyboard events
 */
export type DestinationKeyboardHandler = KeyboardEventHandler<HTMLDivElement>;

/**
 * Combined event handlers used by destination components
 */
export interface DestinationEventHandlers {
  /** Handler for click events */
  onClick: DestinationClickHandler;

  /** Handler for keyboard events (for accessibility) */
  onKeyDown: DestinationKeyboardHandler;
}

/**
 * Props for the DestinationCard component
 *
 * @example
 * ```tsx
 * <DestinationCard
 *   destination={{
 *     id: '123',
 *     name: 'Paris',
 *     city: 'Paris',
 *     country: 'France',
 *     image_url: '/images/paris.jpg',
 *     description: 'City of lights'
 *   }}
 * />
 * ```
 */
export interface DestinationCardProps {
  /** Destination object containing id, name, city, country, and image information */
  destination: Destination;
}

/**
 * Validation result type for data validation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;

  /** Optional array of error messages */
  errors?: string[];

  /** Optional warning messages that don't fail validation */
  warnings?: string[];
}
