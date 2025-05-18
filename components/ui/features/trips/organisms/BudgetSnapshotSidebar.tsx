'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Pencil, Info, Plus, AlertCircle, DollarSign, Check, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';
import { useExpenses } from '@/hooks/use-expenses';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/lib-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Expense } from '@/lib/api/_shared';

interface BudgetSnapshotSidebarProps {
  tripId: string;
  initialBudget?: number | null;
  onBudgetUpdated?: () => void;
  onLogExpenseClick?: () => void;
  /**
   * If true, renders without the Card wrapper (for use inside CollapsibleSection)
   */
  noCardWrapper?: boolean;
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2);
}

export function BudgetSnapshotSidebar({
  tripId,
  initialBudget,
  onBudgetUpdated,
  onLogExpenseClick,
  noCardWrapper = false,
}: BudgetSnapshotSidebarProps) {
  const { toast } = useToast();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use the new expenses hook
  const {
    expenses,
    isLoading,
    error,
    summary,
  } = useExpenses(tripId);

  // Calculate budget and expense info
  const budget = initialBudget || 0;
  const totalSpent = summary?.total || expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const percentSpent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

  // Initialize local budget when target budget changes
  useEffect(() => {
    if (budget !== null) {
      setNewBudgetValue(budget.toString());
    } else {
      setNewBudgetValue('');
    }
  }, [budget]);

  // Calculate progress percentages
  const totalUsed = totalSpent;
  const budgetUsedPercentage = budget > 0
    ? Math.min(Math.round((totalSpent / budget) * 100), 100)
    : 0;
  const isOverBudget = budget > 0 && totalSpent > budget;

  // Handle budget input changes
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setNewBudgetValue(value);
      setErrorMessage(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!newBudgetValue) {
      setErrorMessage('Please enter a budget amount');
      return;
    }

    const budgetValue = parseFloat(newBudgetValue);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setErrorMessage('Please enter a valid budget amount');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Call the API directly to update the budget since useExpenses doesn't expose budget update
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: budgetValue }),
      });
      
      if (response.ok) {
        setIsEditingBudget(false);
        toast({
          title: 'Budget updated',
          description: `Budget set to ${formatCurrency(budgetValue)}`,
        });
        if (onBudgetUpdated) onBudgetUpdated();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrorMessage('Failed to save budget. Please try again.');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update budget',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Determine color for budget status
  const getBudgetStatusColor = () => {
    if (budget <= 0) return 'text-muted-foreground';
    if (percentSpent > 90) return 'text-red-500';
    if (percentSpent > 70) return 'text-amber-500';
    return 'text-green-500';
  };

  // Render budget content section
  const renderContent = () => (
    <>
      <div className="space-y-4">
        {isEditingBudget ? (
          // Edit mode
          <div className="space-y-2">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              <Input
                type="text"
                value={newBudgetValue}
                onChange={handleBudgetChange}
                placeholder="Enter budget amount"
                className="max-w-[150px]"
                autoFocus
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingBudget(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View mode
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                  <span className="text-lg font-semibold mr-2">
                    {budget !== null && budget > 0
                      ? formatCurrency(budget)
                      : 'No Budget Set'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingBudget(true)}>
                    <Pencil className="h-3 w-3" />
                    <span className="sr-only">Edit Budget</span>
                  </Button>
                </div>
                {isOverBudget && (
                  <Badge variant="destructive" className="ml-2">
                    Over Budget
                  </Badge>
                )}
              </div>

              {/* Budget progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>
                    {formatCurrency(totalSpent)} spent ({percentSpent}%)
                  </span>
                  {budget > 0 && (
                    <span>
                      {formatCurrency(budget - totalSpent)} remaining
                    </span>
                  )}
                </div>
                <div className="relative w-full h-2 bg-muted overflow-hidden rounded-full">
                  <div
                    className={`absolute left-0 top-0 h-full ${
                      percentSpent > 90 ? 'bg-red-500' : percentSpent > 70 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentSpent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Expense breakdown */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spent:</span>
                <span>{formatCurrency(totalSpent)}</span>
              </div>
              <div className="pt-1 border-t flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(totalSpent)}</span>
              </div>
            </div>

            {/* Recent expenses preview */}
            {expenses.length > 0 && (
              <div className="space-y-2 pt-1 border-t">
                <div className="flex justify-between items-center text-sm">
                  <h4 className="font-medium">Recent Expenses</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={onLogExpenseClick}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Add</span>
                  </Button>
                </div>
                
                {expenses.slice(0, 2).map((expense) => {
                  // Display the expense with the payer name if available in title
                  // No longer need to fetch payer from members array since we now focus on the expense itself
                  
                  return (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-sm text-sm">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium truncate">
                          {expense.title}
                        </div>
                      </div>
                      <div className="font-medium text-xs">
                        {formatCurrency(expense.amount || 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add expense button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onLogExpenseClick}
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Expense
            </Button>

            {budget <= 0 && (
              <div className="text-center">
                <Button size="sm" onClick={() => setIsEditingBudget(true)}>
                  Set Budget
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="mt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-muted-foreground cursor-help">
                <Info className="h-3 w-3 mr-1" />
                What is this?
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p className="text-xs">
                The budget snapshot shows your trip budget status, including planned expenses
                and actual spending. Set a target budget to track your spending against it.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );

  // Conditionally wrap in Card if needed
  if (noCardWrapper) {
    return renderContent();
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Budget Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
} 