/**
 * Budget Snapshot Card
 * 
 * Displays a summary of trip budget, including the target amount,
 * total spent, planned expenses, and a visual progress indicator.
 */
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExpenseAmount } from '../atoms/expense-amount';
import { BudgetProgressIndicator } from '../atoms/budget-progress-indicator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Check, 
  Loader2, 
  Pencil, 
  Info, 
  Plus 
} from 'lucide-react';

export interface BudgetSnapshotCardProps {
  /**
   * Target budget amount
   */
  targetBudget: number | null;
  /**
   * Total amount of actual expenses
   */
  totalSpent: number;
  /**
   * Total amount of planned expenses
   */
  totalPlanned: number;
  /**
   * Whether the user can edit the budget
   */
  canEdit: boolean;
  /**
   * Whether the budget editing mode is active
   */
  isEditing: boolean;
  /**
   * Callback when edit mode is toggled
   */
  onEditToggle: (isEditing: boolean) => void;
  /**
   * Callback to save the new budget amount
   */
  onSave: (newBudget: number) => Promise<void>;
  /**
   * Callback when "Log Expense" button is clicked
   */
  onLogExpenseClick: () => void;
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * If true, renders without the Card wrapper (for use inside CollapsibleSection)
   */
  noCardWrapper?: boolean;
}

/**
 * Displays a budget snapshot with total spent, planned expenses, and budget progress
 */
export function BudgetSnapshotCard({
  targetBudget,
  totalSpent,
  totalPlanned,
  canEdit,
  isEditing,
  onEditToggle,
  onSave,
  onLogExpenseClick,
  className = '',
  noCardWrapper = false
}: BudgetSnapshotCardProps) {
  const [editedBudget, setEditedBudget] = useState<string>(targetBudget?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate if over budget
  const overBudget = targetBudget !== null && totalSpent + totalPlanned > targetBudget;

  // Update editedBudget when targetBudget changes or isEditing mode changes
  useEffect(() => {
    setEditedBudget(targetBudget?.toString() ?? '');
  }, [targetBudget, isEditing]);

  const handleSaveClick = async () => {
    const newBudgetValue = parseFloat(editedBudget);
    if (isNaN(newBudgetValue) || newBudgetValue < 0) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(newBudgetValue);
      onEditToggle(false);
    } catch (error) {
      console.error('Failed to save budget:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    setEditedBudget(targetBudget?.toString() ?? '');
    onEditToggle(false);
  };

  // Budget details content
  const budgetDetailsContent = (
    <div className="space-y-3">
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={editedBudget}
              onChange={(e) => setEditedBudget(e.target.value)}
              placeholder="Set budget"
              className="h-8"
              min="0"
              step="0.01"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancelClick} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-2xl font-bold">
            {targetBudget !== null ? <ExpenseAmount amount={targetBudget} /> : 'No budget set'}
          </div>
          
          {targetBudget !== null && (
            <>
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  Spent: <ExpenseAmount amount={totalSpent} className="font-medium" />
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 dark:bg-orange-950/30 hover:bg-orange-200 cursor-help"
                      >
                        Planned: <ExpenseAmount amount={totalPlanned} className="font-medium" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Estimated costs from itinerary items</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <BudgetProgressIndicator
                spent={totalSpent}
                planned={totalPlanned}
                budget={targetBudget}
                showPercentage={true}
              />
              
              {overBudget && (
                <p className="text-xs text-destructive">
                  Over budget by <ExpenseAmount amount={totalSpent + totalPlanned - targetBudget} />
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  // Log expense button
  const logExpenseButton = !isEditing && (
    <Button variant="outline" size="sm" className="w-full" onClick={onLogExpenseClick}>
      <Plus className="h-4 w-4 mr-2" />
      Log Expense
    </Button>
  );

  // Title and Edit button
  const titleAndEditButton = (
    <>
      <span className="text-sm font-medium">Budget Snapshot</span>
      {canEdit && !isEditing && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditToggle(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </>
  );

  // Render without card wrapper
  if (noCardWrapper) {
    return (
      <div className={className}>
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-1">
          {titleAndEditButton}
        </div>
        <div className="px-4">{budgetDetailsContent}</div>
        <div className="pt-4 border-t px-4 pb-4">{logExpenseButton}</div>
      </div>
    );
  }

  // Render with card wrapper
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budget Snapshot</CardTitle>
        {canEdit && !isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onEditToggle(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>{budgetDetailsContent}</CardContent>
      <CardFooter className="pt-4 border-t">{logExpenseButton}</CardFooter>
    </Card>
  );
} 