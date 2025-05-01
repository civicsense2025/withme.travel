/**
 * UI-related constants for the withme.travel application
 *
 * This file contains constants related to UI elements:
 * - THEME: Theme colors and properties
 * - LIMITS: Form field limits and constraints
 * - TIME_FORMATS: Date and time display formats
 */

import { ITINERARY_CATEGORIES } from './status';

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

// Defined limits for inputs
export const INPUT_LIMITS = {
  TRIP_NAME: 100,
  DESCRIPTION: 1000,
  COMMENT: 500,
  TAG: 30,
  NOTE_TITLE: 100,
  NOTE_CONTENT: 5000,
};

// Itinerary category emojis and colors
export const CATEGORY_DISPLAY = {
  // Accommodations gets a special section
  [ITINERARY_CATEGORIES.ACCOMMODATIONS]: {
    emoji: '🏨',
    label: 'Accommodations',
    color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  },
  // Transportation gets a special section
  [ITINERARY_CATEGORIES.TRANSPORTATION]: {
    emoji: '✈️',
    label: 'Transportation',
    color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  },
  // Regular categories
  [ITINERARY_CATEGORIES.FOOD_DRINK]: {
    emoji: '🍽️',
    label: 'Food & Drink',
    color: 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
  },
  [ITINERARY_CATEGORIES.ICONIC_LANDMARKS]: {
    emoji: '🏛️',
    label: 'Landmark',
    color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  },
  [ITINERARY_CATEGORIES.LOCAL_SECRETS]: {
    emoji: '🗝️',
    label: 'Local Secret',
    color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
  },
  [ITINERARY_CATEGORIES.CULTURAL_EXPERIENCES]: {
    emoji: '🎭',
    label: 'Cultural',
    color: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  },
  [ITINERARY_CATEGORIES.OUTDOOR_ADVENTURES]: {
    emoji: '🏞️',
    label: 'Outdoor',
    color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
  },
  [ITINERARY_CATEGORIES.NIGHTLIFE]: {
    emoji: '🌃',
    label: 'Nightlife',
    color: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
  },
  [ITINERARY_CATEGORIES.RELAXATION]: {
    emoji: '🧘',
    label: 'Relaxation',
    color: 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400',
  },
  [ITINERARY_CATEGORIES.SHOPPING]: {
    emoji: '🛍️',
    label: 'Shopping',
    color: 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400',
  },
  [ITINERARY_CATEGORIES.GROUP_ACTIVITIES]: {
    emoji: '👥',
    label: 'Group Activity',
    color: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400',
  },
  [ITINERARY_CATEGORIES.DAY_EXCURSIONS]: {
    emoji: '🚐',
    label: 'Excursion',
    color: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  },
  [ITINERARY_CATEGORIES.FLEXIBLE_OPTIONS]: {
    emoji: '🔄',
    label: 'Flexible',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  },
  [ITINERARY_CATEGORIES.SPECIAL_OCCASIONS]: {
    emoji: '🎉',
    label: 'Special Occasion',
    color: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
  },
};

// Default category for items with no category
export const DEFAULT_CATEGORY_DISPLAY = {
  emoji: '📌',
  label: 'Activity',
  color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

// Item type emojis and colors
export const ITEM_TYPE_DISPLAY = {
  accommodation: {
    emoji: '🏨',
    label: 'Accommodation',
    color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  },
  transportation: {
    emoji: '✈️',
    label: 'Transportation',
    color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  },
  activity: {
    emoji: '🎯',
    label: 'Activity',
    color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  },
  food: {
    emoji: '🍽️',
    label: 'Food & Dining',
    color: 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
  },
};

// Default type display
export const DEFAULT_TYPE_DISPLAY = {
  emoji: '📌',
  label: 'Item',
  color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

// Item status emojis and colors
export const ITEM_STATUS_DISPLAY = {
  confirmed: {
    emoji: '✅',
    label: 'Confirmed',
    color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
  },
  booked: {
    emoji: '🎫',
    label: 'Booked',
    color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  },
  pending: {
    emoji: '⏳',
    label: 'Pending',
    color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
  },
  cancelled: {
    emoji: '❌',
    label: 'Cancelled',
    color: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  },
  completed: {
    emoji: '🏆',
    label: 'Completed',
    color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  },
};
