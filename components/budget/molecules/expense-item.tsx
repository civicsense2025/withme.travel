/**
 * ExpenseItem Component (Molecule)
 * 
 * Displays a single expense item with category, amount, description, and date.
 * 
 * @module budget/molecules
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ExpenseAmount } from '../atoms/expense-amount';
import { ExpenseCategoryBadge, ExpenseCategory } from '../atoms/expense-category-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ============================================================================
// TYPES
// ============================================================================

export type ExpenseCategory =
  | 'food'
  | 'transportation'
  | 'accommodation'
  | 'activities'
  | 'shopping'
  | 'other';

export interface ExpenseItemProps {
  /** Expense ID */
  id: string;
  /** Expense amount */
  amount: number;
  /** Expense description */
  description: string;
  /** Expense category */
  category: ExpenseCategory;
  /** Expense date */
  date: string | Date;
  /** User who created the expense */
  createdBy?: {
    name: string;
    avatar?: string;
  };
  /** Optional click handler */
  onClick?: (id: string) => void;
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a single expense item
 */
export function ExpenseItem({
  id,
  amount,
  description,
  category,
  date,
  createdBy,
  onClick,
  className,
}: ExpenseItemProps) {
  // Format the date
  const formattedDate = typeof date === 'string' 
    ? format(new Date(date), 'MMM d, yyyy')
    : format(date, 'MMM d, yyyy');
    
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };
  
  return (
    <div 
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <ExpenseCategoryBadge category={category} />
        
        <div>
          <div className="font-medium">{description}</div>
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {createdBy && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={createdBy.avatar} alt={createdBy.name} />
            <AvatarFallback>
              {createdBy.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <ExpenseAmount amount={amount} className="font-semibold" />
      </div>
    </div>
  );
}
