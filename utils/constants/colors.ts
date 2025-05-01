/**
 * Color-related constants
 *
 * This file contains all color-related constants including category colors,
 * status colors, and other color mappings used throughout the application.
 */

import { BUDGET_CATEGORIES } from './validation';

/**
 * Colors for expense categories
 * Used for visual representation of expense categories in charts and UI elements
 */
export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  accommodation: '#4f46e5', // indigo
  food: '#16a34a', // green
  transportation: '#f59e0b', // amber
  activities: '#06b6d4', // cyan
  shopping: '#ec4899', // pink
  other: '#6b7280', // gray
} as const;

// Ensure all budget categories have a corresponding color
// This creates a type-safe mapping between budget categories and their colors
export const BUDGET_CATEGORY_COLORS: Record<keyof typeof BUDGET_CATEGORIES, string> = {
  ACCOMMODATION: EXPENSE_CATEGORY_COLORS.accommodation,
  FOOD: EXPENSE_CATEGORY_COLORS.food,
  TRANSPORTATION: EXPENSE_CATEGORY_COLORS.transportation,
  ACTIVITIES: EXPENSE_CATEGORY_COLORS.activities,
  SHOPPING: EXPENSE_CATEGORY_COLORS.shopping,
  OTHER: EXPENSE_CATEGORY_COLORS.other,
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
