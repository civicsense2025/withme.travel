/**
 * Expense Card (Molecule)
 *
 * A card displaying expense details with category, amount, date, and actions.
 *
 * @module expenses/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { User, MoreVertical, Edit, Trash } from 'lucide-react';
import { ExpenseAmount } from '../atoms/expense-amount';
import { ExpenseCategoryBadge } from '../atoms/expense-category-badge';
import { DateBadge } from '../atoms/date-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string | Date;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  paidBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  splitWith?: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    amount?: number;
  }>;
}

export interface ExpenseCardProps {
  /** The expense data to display */
  expense: Expense;
  /** Callback for editing the expense */
  onEdit?: (id: string) => void;
  /** Callback for deleting the expense */
  onDelete?: (id: string) => void;
  /** Whether the expense can be edited/deleted */
  canEdit?: boolean;
  /** Whether to show detailed info like split */
  expanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a date for display in the card
 */
const formatExpenseDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  canEdit = false,
  expanded = false,
  className,
}: ExpenseCardProps) {
  const formattedDate = formatExpenseDate(expense.date);
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <ExpenseCategoryBadge 
                category={expense.category as any} 
                size="sm" 
              />
              <DateBadge date={expense.date} />
            </div>
            
            <h4 className="text-base font-medium truncate mb-0.5">
              {expense.description}
            </h4>
            
            {expense.paidBy && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span>Paid by</span>
                <Avatar className="h-5 w-5">
                  <AvatarImage 
                    src={expense.paidBy.avatarUrl} 
                    alt={expense.paidBy.name} 
                  />
                  <AvatarFallback className="text-xs">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">
                  {expense.paidBy.name}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <ExpenseAmount 
              amount={expense.amount} 
              currency={expense.currency}
              className="text-lg font-semibold"
            />
            
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(expense.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {expanded && expense.splitWith && expense.splitWith.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <h5 className="text-sm font-medium mb-2">Split with</h5>
            <div className="flex flex-wrap gap-2">
              {expense.splitWith.map((person) => (
                <div 
                  key={person.id}
                  className="flex items-center gap-1.5 bg-muted rounded-full px-2 py-1 text-xs"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={person.avatarUrl} alt={person.name} />
                    <AvatarFallback className="text-[10px]">
                      <User className="h-2 w-2" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[100px]">{person.name}</span>
                  {person.amount !== undefined && (
                    <span className="font-medium">
                      {expense.currency} {person.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 