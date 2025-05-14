/**
 * Color-related constants
 *
 * This file contains all color-related constants including category colors,
 * status colors, and other color mappings used throughout the application.
 
 */

import type { Database } from './database';

/**
 * Colors for expense categories
 * Used for visual representation of expense categories in charts and UI elements
 
 */

export const EXPENSE_CATEGORY_COLORS: Record<
  Database['public']['Enums']['budget_category'],
  string
> = {
  accommodation: '#4f46e5', // indigo
  food: '#16a34a', // green
  transportation: '#f59e0b', // amber
  activities: '#06b6d4', // cyan
  shopping: '#ec4899', // pink
  other: '#6b7280', // gray
} as const;

// Use DB enum values as keys
export const BUDGET_CATEGORY_COLORS: Record<
  Database['public']['Enums']['budget_category'],
  string
> = {
  accommodation: EXPENSE_CATEGORY_COLORS.accommodation,
  food: EXPENSE_CATEGORY_COLORS.food,
  transportation: EXPENSE_CATEGORY_COLORS.transportation,
  activities: EXPENSE_CATEGORY_COLORS.activities,
  shopping: EXPENSE_CATEGORY_COLORS.shopping,
  other: EXPENSE_CATEGORY_COLORS.other,
} as const;

/**
 * Status colors for various UI elements
 
 */

export const STATUS_COLORS = {
  SUCCESS: '#10b981', // emerald-500
  ERROR: '#ef4444', // red-500
  WARNING: '#f59e0b', // amber-500
  INFO: '#3b82f6', // blue-500
  PENDING: '#6b7280', // gray-500
} as const;
