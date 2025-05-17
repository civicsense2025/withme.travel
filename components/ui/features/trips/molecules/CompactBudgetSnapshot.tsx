import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface CompactBudgetSnapshotProps {
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

/**
 * CompactBudgetSnapshot
 * Displays a compact budget summary with visual indicators and edit functionality
 */
export function CompactBudgetSnapshot({
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
  const [inputValue, setInputValue] = useState(targetBudget?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Format currency consistently
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '$0';
    return `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };
  
  // Calculate percentage used for progress bar
  const percentSpent = targetBudget && targetBudget > 0 
    ? Math.min(Math.round((totalSpent / targetBudget) * 100), 100)
    : 0;
  
  const isOverBudget = targetBudget !== null && totalSpent > targetBudget;
  
  // Handle save action
  const handleSave = async () => {
    if (!inputValue) return;
    
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return;
    
    setIsSaving(true);
    try {
      await onSave(numValue);
      onEditToggle(false);
    } catch (error) {
      console.error('Error saving budget', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <div className="text-xs text-muted-foreground">Budget</div>
      
      {isEditing ? (
        // Edit mode
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2">
            <Input 
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-24 text-right"
              min="0"
              autoFocus
            />
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 px-2"
              onClick={() => onEditToggle(false)}
              disabled={isSaving}
            >
              <X className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="h-7 px-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 
                <span className="animate-pulse">Saving...</span> : 
                <Check className="h-3 w-3" />
              }
            </Button>
          </div>
        </div>
      ) : (
        // View mode
        <>
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg">
              {targetBudget !== null ? (
                <span>
                  {formatCurrency(totalSpent)} / {formatCurrency(targetBudget)}
                </span>
              ) : (
                <span>{formatCurrency(totalSpent)}</span>
              )}
            </div>
            {canEdit && (
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onEditToggle(true)}>
                <Pencil className="h-3 w-3" />
                <span className="sr-only">Edit Budget</span>
              </Button>
            )}
          </div>
          
          {targetBudget !== null && targetBudget > 0 && (
            <div className="w-full mt-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    isOverBudget 
                      ? 'bg-destructive' 
                      : percentSpent > 80 
                        ? 'bg-amber-500' 
                        : 'bg-primary'
                  }`}
                  style={{ width: `${percentSpent}%` }}
                />
              </div>
              <div className="text-xs mt-0.5">
                {isOverBudget ? (
                  <span className="text-destructive font-medium">Over budget!</span>
                ) : (
                  <span>{percentSpent}% used</span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-1">
            {canEdit && targetBudget === null && (
              <Button size="sm" variant="outline" onClick={() => onEditToggle(true)}>
                Set Budget
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={onLogExpenseClick}>
              Log Expense
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 