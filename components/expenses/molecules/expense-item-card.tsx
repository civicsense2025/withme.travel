/**
 * Expense Item Card
 * 
 * Displays a single expense item in a card format.
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ExpenseCategoryIcon } from '../atoms/expense-category-icon';
import { ExpenseAmount } from '../atoms/expense-amount';
import { DateBadge } from '../atoms/date-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnifiedExpense } from '@/hooks/use-trip-budget';

export interface ExpenseItemCardProps {
  /**
   * The expense item to display
   */
  expense: UnifiedExpense;
  /**
   * Callback for editing the expense
   */
  onEdit?: (expense: UnifiedExpense) => void;
  /**
   * Callback for deleting the expense
   */
  onDelete?: (expense: UnifiedExpense) => void;
  /**
   * Optional CSS class for the card
   */
  className?: string;
  /**
   * Whether the user can edit this expense
   */
  canEdit?: boolean;
  /**
   * Whether to use a compact layout
   */
  compact?: boolean;
}

/**
 * Card component that displays an expense with category, amount, date, and paid by info
 */
export function ExpenseItemCard({
  expense,
  onEdit,
  onDelete,
  className = '',
  canEdit = false,
  compact = false
}: ExpenseItemCardProps) {
  const handleEdit = () => {
    if (onEdit) onEdit(expense);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(expense);
  };

  // Get the first initial for the avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <Card className={`${className} ${compact ? 'p-0' : ''}`}>
      <CardContent className={`${compact ? 'p-3' : 'p-4'} flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-muted flex-shrink-0`}>
            <ExpenseCategoryIcon 
              category={expense.category || 'other'} 
              size={compact ? 14 : 16} 
            />
          </div>
          
          <div>
            <div className={`font-medium ${compact ? 'text-sm' : ''}`}>
              {expense.title || 'Unnamed expense'}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <DateBadge 
                date={expense.date} 
                compact={compact}
                showIcon={false}
                variant="outline"
              />
              
              {expense.paidBy && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="mr-1">Paid by:</span>
                  <Avatar className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} mr-1`}>
                    <AvatarImage src={''} alt={expense.paidBy} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(expense.paidBy)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[80px]">{expense.paidBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ExpenseAmount 
            amount={expense.amount || 0} 
            currency={expense.currency || 'USD'} 
            className={`font-medium ${compact ? 'text-sm' : ''}`}
          />
          
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`${compact ? 'h-7 w-7' : 'h-8 w-8'}`}>
                  <MoreHorizontal className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 