"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Assuming tooltip is in ui

interface BudgetSnapshotSidebarProps {
  targetBudget: number | null;
  totalPlanned: number;
  totalSpent: number;
  canEdit: boolean;
  isEditing: boolean;
  onEditToggle: (isEditing: boolean) => void;
  onSave: (newBudget: number) => Promise<void>;
  onLogExpenseClick: () => void; // Keep this if the button stays here
}

// Helper to format currency (could be moved to utils)
const formatCurrency = (value: number | null | undefined | string): string => {
  if (value === null || value === undefined) return "N/A";
  let numericValue: number;
  if (typeof value === 'string') {
    if (value.trim() === '' || isNaN(parseFloat(value))) return "N/A";
    numericValue = parseFloat(value);
  } else if (typeof value === 'number') {
    numericValue = value;
  } else {
    return "N/A";
  }
  if (isNaN(numericValue)) return "N/A";
  return `$${numericValue.toFixed(2)}`;
};

export function BudgetSnapshotSidebar({ // Export the component
  targetBudget,
  totalPlanned,
  totalSpent,
  canEdit,
  isEditing,
  onEditToggle,
  onSave,
  onLogExpenseClick,
}: BudgetSnapshotSidebarProps) {
  const [editedBudget, setEditedBudget] = useState<string>(targetBudget?.toString() ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedBudget(targetBudget?.toString() ?? "");
  }, [targetBudget, isEditing]);

  const handleSaveClick = async () => {
    const newBudgetValue = parseFloat(editedBudget);
    if (isNaN(newBudgetValue) || newBudgetValue < 0) {
      console.error("Invalid budget value");
      // Consider adding a toast notification here for user feedback
      return;
    }
    setIsSaving(true);
    try {
      await onSave(newBudgetValue);
      // Success: Parent component might call onEditToggle(false)
    } catch (error) {
      console.error("Failed to save budget from sidebar:", error);
      // Error handled by parent toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    onEditToggle(false);
  };

  const remaining = targetBudget !== null ? targetBudget - totalPlanned : null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-md flex items-center">Budget Snapshot</h3>
        {canEdit && !isEditing && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditToggle(true)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Budget</span>
          </Button>
        )}
      </div>

      {/* Budget Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Target Budget:</span>
          {isEditing ? (
            <Input
              type="number"
              value={editedBudget}
              onChange={(e) => setEditedBudget(e.target.value)}
              placeholder="Enter budget"
              className="h-8 max-w-[120px] text-right"
              min="0"
              step="10"
            />
          ) : (
            <span className="font-medium">{formatCurrency(targetBudget)}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Planned:</span>
          <span className="font-medium">{formatCurrency(totalPlanned)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Spent:</span>
          <span className="font-medium">{formatCurrency(totalSpent)}</span>
        </div>
        <hr className="my-2 border-dashed" />
        <div className="flex justify-between font-semibold">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center cursor-help">
                Remaining
                <Info className="h-3 w-3 ml-1 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Remaining = Target Budget - Total Planned</p>
              <p className="text-xs text-muted-foreground">(Planned includes itinerary item costs)</p>
            </TooltipContent>
          </Tooltip>
          <span className={remaining !== null && remaining < 0 ? 'text-destructive' : ''}>{formatCurrency(remaining)}</span>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end gap-2 pt-3 border-t border-dashed mt-3">
          <Button variant="ghost" size="sm" onClick={handleCancelClick} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Budget
          </Button>
        </div>
      )}

      {/* Button to log expense - Consider moving this to the main BudgetTab if more appropriate */}
      {/* <Button variant="outline" size="sm" className="w-full mt-4" onClick={onLogExpenseClick}>
        Log Manual Expense
      </Button> */}
    </div>
  );
}

// Default export
export default BudgetSnapshotSidebar; 