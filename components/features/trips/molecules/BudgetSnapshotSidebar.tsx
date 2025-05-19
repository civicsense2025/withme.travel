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

// Re-introduce local formatCurrency helper
const formatCurrency = (value: number | null | undefined | string): string => {
  if (value === null || value === undefined) return 'N/A';
  let numericValue: number;
  if (typeof value === 'string') {
    // Attempt to parse, return 'N/A' if invalid or empty after trimming
    const trimmedValue = value.trim();
    if (trimmedValue === '' || isNaN(Number.parseFloat(trimmedValue))) return 'N/A';
    numericValue = Number.parseFloat(trimmedValue);
  } else if (typeof value === 'number') {
    numericValue = value;
  } else {
    return 'N/A';
  }
  if (isNaN(numericValue)) return 'N/A'; // Check after potential parsing
  return `$${numericValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; // Use toLocaleString for better formatting
};

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
  const [editedBudget, setEditedBudget] = useState<string>(targetBudget?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate progress percentages
  const spentProgress = targetBudget && targetBudget > 0 ? (totalSpent / targetBudget) * 100 : 0;
  const plannedProgress =
    targetBudget && targetBudget > 0 ? (totalPlanned / targetBudget) * 100 : 0;
  const combinedProgress = spentProgress + plannedProgress;
  const overBudget = targetBudget !== null && totalSpent + totalPlanned > targetBudget;

  // Update editedBudget when targetBudget changes or isEditing mode changes
  useEffect(() => {
    setEditedBudget(targetBudget?.toString() ?? '');
  }, [targetBudget, isEditing]);

  const handleSaveClick = async () => {
    const newBudgetValue = parseFloat(editedBudget);
    if (isNaN(newBudgetValue) || newBudgetValue < 0) {
      console.error('Invalid budget value');
      // Consider adding a toast notification here for user feedback
      return;
    }
    setIsSaving(true);
    try {
      await onSave(newBudgetValue);
      onEditToggle(false);
    } catch (error) {
      console.error('Failed to save budget from sidebar:', error);
      // Error handled by parent toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    setEditedBudget(targetBudget?.toString() ?? '');
    onEditToggle(false);
  };

  // Direct Log Expense button handler to ensure it works
  const handleLogExpenseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLogExpenseClick();
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
            {targetBudget !== null ? formatCurrency(targetBudget) : 'No budget set'}
          </div>
          {targetBudget !== null && (
            <>
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">Spent: {formatCurrency(totalSpent)}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className="bg-orange-100 dark:bg-orange-950/30 hover:bg-orange-200 cursor-help"
                      >
                        Planned: {formatCurrency(totalPlanned)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Estimated costs from itinerary items</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                  <div
                    style={{ width: `${Math.min(spentProgress, 100)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    title={`Spent: ${formatCurrency(totalSpent)}`}
                  ></div>
                  <div
                    style={{
                      width: `${Math.min(plannedProgress, Math.max(0, 100 - spentProgress))}%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-400"
                    title={`Planned: ${formatCurrency(totalPlanned)}`}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-right py-2">
                {combinedProgress.toFixed(0)}% of budget
              </p>
              {overBudget && (
                <p className="text-xs text-destructive">
                  Over budget by {formatCurrency(totalSpent + totalPlanned - targetBudget)}
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
      <>
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-1">
          {titleAndEditButton}
        </div>
        <div className="px-4">{budgetDetailsContent}</div>
        <div className="pt-4 border-t px-4 pb-4">{logExpenseButton}</div>
      </>
    );
  }

  // Render with card wrapper
  return (
    <Card>
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

export default BudgetSnapshotSidebar; 