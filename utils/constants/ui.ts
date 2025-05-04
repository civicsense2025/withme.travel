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

// Category emojis, labels and colors
export const CATEGORY_DISPLAY = {
  'Iconic Landmarks': {
    emoji: '🏛️',
    label: 'Iconic Landmarks',
    color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  },
  'Local Secrets': {
    emoji: '🔍',
    label: 'Local Secrets',
    color: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
  },
  'Cultural Experiences': {
    emoji: '🎭',
    label: 'Cultural Experiences',
    color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
  },
  'Outdoor Adventures': {
    emoji: '🏔️',
    label: 'Outdoor Adventures',
    color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  },
  'Food & Drink': {
    emoji: '🍴',
    label: 'Food & Drink',
    color: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  },
  'Nightlife': {
    emoji: '🌙',
    label: 'Nightlife',
    color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  },
  'Relaxation': {
    emoji: '🧘',
    label: 'Relaxation',
    color: 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400',
  },
  'Shopping': {
    emoji: '🛍️',
    label: 'Shopping',
    color: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
  },
  'Entertainment': {
    emoji: '🎬',
    label: 'Entertainment',
    color: 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
  },
  'Health & Wellness': {
    emoji: '💆',
    label: 'Health & Wellness',
    color: 'bg-lime-100 dark:bg-lime-950 text-lime-600 dark:text-lime-400',
  },
  'Educational': {
    emoji: '📚',
    label: 'Educational',
    color: 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400',
  },
  'Photography': {
    emoji: '📸',
    label: 'Photography',
    color: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-600 dark:text-fuchsia-400',
  },
  'Accommodations': {
    emoji: '🏨',
    label: 'Accommodations',
    color: 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400',
  },
  'Transportation': {
    emoji: '🚆',
    label: 'Transportation',
    color: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  },
  'Other': {
    emoji: '📌',
    label: 'Other',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  },
  'Flexible Options': {
    emoji: '🔄',
    label: 'Flexible Options',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
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
  suggested: {
    emoji: '💡',
    label: 'Suggested',
    color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  },
  confirmed: {
    emoji: '✅',
    label: 'Confirmed',
    color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
  },
  rejected: {
    emoji: '❌',
    label: 'Rejected',
    color: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  },
};
