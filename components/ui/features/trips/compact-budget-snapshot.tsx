'use client';

import React, { useState } from 'react';
import { PlusCircle, Wallet, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import BudgetSnapshotSidebar from './budget-snapshot-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper function to format currency
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface CompactBudgetSnapshotProps {
  targetBudget: number | null;
  totalPlanned: number;
  totalSpent: number;
  canEdit: boolean;
  isEditing: boolean;
  onEditToggle: (isEditing: boolean) => void;
  onSave: (newBudget: number) => Promise<void>;
  onLogExpenseClick: () => void;
  tripId: string;
}

export default function CompactBudgetSnapshot({
  targetBudget,
  totalPlanned,
  totalSpent,
  canEdit,
  isEditing,
  onEditToggle,
  onSave,
  onLogExpenseClick,
  tripId,
}: CompactBudgetSnapshotProps) {
  const hasTargetBudget = targetBudget !== null;
  const budgetValue = hasTargetBudget ? formatCurrency(targetBudget) : 'Click to set budget';
  const remainingValue = hasTargetBudget
    ? formatCurrency(targetBudget - totalSpent - totalPlanned)
    : 'N/A';
  const isOverBudget = hasTargetBudget && totalSpent + totalPlanned > targetBudget;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);

  // Handle local editing state
  const handleEditToggle = (editing: boolean) => {
    setLocalIsEditing(editing);
    onEditToggle(editing);
  };

  // Handle local save
  const handleSave = async (newBudget: number) => {
    try {
      await onSave(newBudget);
      setLocalIsEditing(false);
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  // Handle local expense logging
  const handleLogExpense = () => {
    setSheetOpen(false); // Close the sheet first
    // Small delay to allow sheet to close
    setTimeout(() => {
      onLogExpenseClick();
    }, 100);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto bg-background hover:bg-background/80"
        >
          <Wallet className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Budget: &nbsp; </span> {budgetValue}
          <span className={`ml-2 ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
            ({remainingValue} remaining)
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <div className="mt-2">
          <BudgetSnapshotSidebar
            targetBudget={targetBudget}
            totalPlanned={totalPlanned}
            totalSpent={totalSpent}
            canEdit={canEdit}
            isEditing={localIsEditing}
            onEditToggle={handleEditToggle}
            onSave={handleSave}
            onLogExpenseClick={handleLogExpense}
            noCardWrapper={false}
          />

          {hasTargetBudget && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Expense Summary</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Budget:</span>
                  <span className="font-medium">{formatCurrency(targetBudget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Amount Spent:</span>
                  <span className="font-medium">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Planned Expenses:</span>
                  <span className="font-medium">{formatCurrency(totalPlanned)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold pt-1 border-t">
                  <span className="text-sm">Remaining:</span>
                  <span className={isOverBudget ? 'text-destructive' : 'text-green-600'}>
                    {formatCurrency(targetBudget - totalSpent - totalPlanned)}
                  </span>
                </div>
              </div>

              {/* Expense Breakdown - Placeholder */}
              <div className="mt-5">
                <div className="flex items-center mb-3">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <h3 className="text-md font-semibold">Expense Breakdown</h3>
                </div>

                <ScrollArea className="h-[100px] pr-4">
                  <p className="text-sm text-center text-muted-foreground py-3">
                    This feature will show a per-person expense breakdown.
                  </p>
                </ScrollArea>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSheetOpen(false);
                    // Navigate to the budget tab for the full expense breakdown
                    window.location.href = `#budget-section`;
                  }}
                >
                  View Full Expense Breakdown
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
