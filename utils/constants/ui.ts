/**
 * UI-related constants for the withme.travel application
 *
 * This file contains constants related to UI elements:
 * - THEME: Theme colors and properties
 * - LIMITS: Form field limits and constraints
 * - TIME_FORMATS: Date and time display formats
 */

// Theme related constants
export const THEME = {
  COLORS: {
    BLUE: 'travel-blue',
    PINK: 'travel-pink',
    YELLOW: 'travel-yellow',
    PURPLE: 'travel-purple',
    MINT: 'travel-mint',
    PEACH: 'travel-peach',
  },
};

// Form Field Limits
export const LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 500,
  MEMBERS_MAX: 20,
} as const;

// Time Formats
export const TIME_FORMATS = {
  DEFAULT: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  DISPLAY_DATE: 'MMM d, yyyy',
  DISPLAY_TIME: 'h:mm a',
  INPUT_DATE: 'yyyy-MM-dd',
  FULL_DATE: 'EEEE, MMMM d, yyyy',
  SHORT_DATE: 'MMM d',
} as const;
