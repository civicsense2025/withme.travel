'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Pencil, Info, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';

interface BudgetSnapshotSidebarProps {
  targetBudget: number | null;
  totalPlanned: number;
  totalSpent: number;
  canEdit: boolean;
  isEditing: boolean;
  onEditToggle: (isEditing: boolean) => void;
  onSave: (newBudget: number) => Promise<void>;
  onLogExpenseClick: () => void;
  /**
   * If true, renders without the Card wrapper (for use inside CollapsibleSection)
   */
  noCardWrapper?: boolean;
}

export function BudgetSnapshotSidebar({
  targetBudget,
  totalPlanned,
  totalSpent,
  canEdit,
  isEditing,
  onEditToggle,
  onSave,
  onLogExpenseClick,
  noCardWrapper = false,
}: BudgetSnapshotSidebarProps) {
  const [localBudget, setLocalBudget] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Format number to fixed 2 decimal places
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Initialize local budget when target budget changes
  useEffect(() => {
    if (targetBudget !== null) {
      setLocalBudget(targetBudget.toString());
    } else {
      setLocalBudget('');
    }
  }, [targetBudget]);

  // Calculate progress percentages
  const totalUsed = totalSpent + totalPlanned;
  const budgetUsedPercentage = targetBudget
    ? Math.min(Math.round((totalUsed / targetBudget) * 100), 100)
    : 0;
  const isOverBudget = targetBudget !== null && totalUsed > targetBudget;

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      onEditToggle(false);
    } else {
      onEditToggle(true);
    }
  };

  // Handle budget input changes
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setLocalBudget(value);
      setErrorMessage(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!localBudget) {
      setErrorMessage('Please enter a budget amount');
      return;
    }

    const budgetValue = parseFloat(localBudget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setErrorMessage('Please enter a valid budget amount');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await onSave(budgetValue);
      onEditToggle(false); // Exit edit mode after successful save
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrorMessage('Failed to save budget. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Render budget content section
  const renderContent = () => (
    <>
      <div className="space-y-4">
        {isEditing ? (
          // Edit mode
          <div className="space-y-2">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              <Input
                type="text"
                value={localBudget}
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
                onClick={() => onEditToggle(false)}
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
                    {targetBudget !== null
                      ? formatCurrency(targetBudget)
                      : 'No Budget Set'}
                  </span>
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={handleEditToggle}>
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Edit Budget</span>
                    </Button>
                  )}
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
                    {formatCurrency(totalUsed)} used (
                    {targetBudget ? Math.round((totalUsed / targetBudget) * 100) : 0}%)
                  </span>
                  {targetBudget !== null && (
                    <span>
                      {formatCurrency(targetBudget - totalUsed)} remaining
                    </span>
                  )}
                </div>
                <Progress 
                  value={budgetUsedPercentage} 
                  className={`h-2 ${isOverBudget ? 'bg-red-200' : ''}`}
                />
              </div>
            </div>

            {/* Expense breakdown */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spent:</span>
                <span>{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planned:</span>
                <span>{formatCurrency(totalPlanned)}</span>
              </div>
              <div className="pt-1 border-t flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(totalUsed)}</span>
              </div>
            </div>

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

            {targetBudget === null && canEdit && (
              <div className="text-center">
                <Button size="sm" onClick={handleEditToggle}>
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