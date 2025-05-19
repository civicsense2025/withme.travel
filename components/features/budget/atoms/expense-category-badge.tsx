/**
 * ExpenseCategoryBadge component displays a badge for expense categories
 *
 * @module budget/atoms
 */

'use client';

import { Badge } from '@/components/ui/badge';
import {
  PlaneIcon,
  BedIcon,
  UtensilsIcon,
  TicketIcon,
  ShoppingBagIcon,
  CarIcon,
  HeartIcon,
  BusIcon,
  FileTextIcon,
  GlobeIcon
} from 'lucide-react';

export type ExpenseCategory = 
  | 'flights'
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'transport'
  | 'healthcare'
  | 'transit'
  | 'fees'
  | 'other';

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  flights: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  accommodation: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
  food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  activities: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  transport: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  healthcare: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  transit: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  fees: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
};

const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  flights: PlaneIcon,
  accommodation: BedIcon,
  food: UtensilsIcon,
  activities: TicketIcon,
  shopping: ShoppingBagIcon,
  transport: CarIcon,
  healthcare: HeartIcon,
  transit: BusIcon,
  fees: FileTextIcon,
  other: GlobeIcon
};

export interface ExpenseCategoryBadgeProps {
  /** The expense category */
  category: ExpenseCategory;
  /** Additional CSS class names */
  className?: string;
  /** Whether to show the icon */
  showIcon?: boolean;
}

/**
 * Displays a badge representing an expense category
 */
export function ExpenseCategoryBadge({
  category,
  className = '',
  showIcon = true
}: ExpenseCategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
  
  return (
    <Badge className={`${colorClass} ${className}`}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}
