/**
 * Expense Category Badge (Atom)
 *
 * A visual indicator showing the category of an expense with
 * appropriate color and icon for each type.
 *
 * @module expenses/atoms
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  UtensilsCrossed, 
  Plane, 
  Ticket, 
  Bus, 
  Music, 
  ShoppingBag, 
  Landmark, 
  HelpCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type ExpenseCategory = 
  | 'accommodation'
  | 'food'
  | 'transportation'
  | 'activities'
  | 'entertainment'
  | 'shopping'
  | 'flights'
  | 'fees'
  | 'other';

export interface ExpenseCategoryBadgeProps {
  /** The expense category to display */
  category: ExpenseCategory;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Size variant of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

interface CategoryConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
}

const CATEGORY_CONFIG: Record<ExpenseCategory, CategoryConfig> = {
  accommodation: {
    label: 'Accommodation',
    icon: <Home className="h-3 w-3" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  food: {
    label: 'Food',
    icon: <UtensilsCrossed className="h-3 w-3" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  transportation: {
    label: 'Transportation',
    icon: <Bus className="h-3 w-3" />,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  activities: {
    label: 'Activities',
    icon: <Ticket className="h-3 w-3" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  entertainment: {
    label: 'Entertainment',
    icon: <Music className="h-3 w-3" />,
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  },
  shopping: {
    label: 'Shopping',
    icon: <ShoppingBag className="h-3 w-3" />,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  },
  flights: {
    label: 'Flights',
    icon: <Plane className="h-3 w-3" />,
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  },
  fees: {
    label: 'Fees',
    icon: <Landmark className="h-3 w-3" />,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  other: {
    label: 'Other',
    icon: <HelpCircle className="h-3 w-3" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ExpenseCategoryBadge({
  category,
  showIcon = true,
  showLabel = true,
  size = 'md',
  className,
}: ExpenseCategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  
  // Determine size-specific styles
  const sizeStyles = {
    sm: 'text-xs py-0 px-1.5',
    md: 'text-xs py-1 px-2',
    lg: 'text-sm py-1 px-2.5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        sizeStyles[size],
        'border-0 font-normal',
        className
      )}
    >
      {showIcon && (
        <span className={cn('mr-1', !showLabel && 'mr-0')}>
          {config.icon}
        </span>
      )}
      {showLabel && config.label}
    </Badge>
  );
} 