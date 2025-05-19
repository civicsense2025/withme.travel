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
  budget: number | null;
  /**
   * Total amount of actual expenses
   */
  spent: number;
  /**
   * Total percentage spent
   */
  percentSpent: number;
  /**
   * Total amount of planned expenses (optional)
   */
  totalPlanned?: number;
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
  onBudgetUpdate: (newBudget: number) => Promise<void>;
  /**
   * Callback when "Log Expense" button is clicked (optional)
   */
  onLogExpenseClick?: () => void;
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
  budget,
  spent,
  percentSpent,
  totalPlanned = 0,
  canEdit,
  isEditing,
  onEditToggle,
  onBudgetUpdate,
  onLogExpenseClick,
  className = '',
  noCardWrapper = false
}: BudgetSnapshotCardProps) {
  const [editedBudget, setEditedBudget] = useState<string>(budget?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate if over budget
  const overBudget = budget !== null && spent + totalPlanned > budget;

  // Update editedBudget when budget changes or isEditing mode changes
  useEffect(() => {
    setEditedBudget(budget?.toString() ?? '');
  }, [budget, isEditing]);

  const handleSaveClick = async () => {
    const newBudgetValue = parseFloat(editedBudget);
    if (isNaN(newBudgetValue) || newBudgetValue < 0) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onBudgetUpdate(newBudgetValue);
      onEditToggle(false);
    } catch (error) {
      console.error('Failed to save budget:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    setEditedBudget(budget?.toString() ?? '');
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
            {budget !== null ? <ExpenseAmount amount={budget} /> : 'No budget set'}
          </div>
          
          {budget !== null && (
            <>
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  Spent: <ExpenseAmount amount={spent} className="font-medium" />
                </p>
                {totalPlanned > 0 && (
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
                )}
              </div>
              
              <BudgetProgressIndicator
                spent={spent}
                planned={totalPlanned}
                budget={budget}
                showPercentage={true}
              />
              
              {overBudget && (
                <p className="text-xs text-destructive">
                  Over budget by <ExpenseAmount amount={spent + totalPlanned - budget} className="font-medium" />
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  // Card actions content
  const actionsContent = (
    <div className="flex gap-2 justify-end">
      {!isEditing && canEdit && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEditToggle(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit Budget
          </Button>
          
          {onLogExpenseClick && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogExpenseClick}
            >
              <Plus className="h-4 w-4 mr-1" />
              Log Expense
            </Button>
          )}
        </>
      )}
    </div>
  );

  // Render with or without card wrapper
  if (noCardWrapper) {
    return (
      <div className={className}>
        {budgetDetailsContent}
        {actionsContent}
      </div>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-md">
          Budget Summary
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">Set your trip budget and track expenses</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {budgetDetailsContent}
      </CardContent>
      
      <CardFooter className="pt-0">
        {actionsContent}
      </CardFooter>
    </Card>
  );
} 