// =============================================================================
// COMPACT BUDGET SNAPSHOT ORGANISM
// =============================================================================

import React from 'react';
import { formatCurrency } from '@/lib/utils';

/**
 * Props for CompactBudgetSnapshot
 */
export interface CompactBudgetSnapshotProps {
  /** Total trip budget */
  targetBudget: number;
  /** Total planned expenses */
  totalPlanned: number;
  /** Total spent so far */
  totalSpent: number;
  /** Currency code (e.g., 'USD') */
  currency?: string;
  /** Optional: show as card */
  asCard?: boolean;
  /** Can user edit budget */
  canEdit?: boolean;
  /** Is currently editing */
  isEditing?: boolean;
  /** Toggle edit mode */
  onEditToggle?: () => void;
  /** Save budget */
  onSave?: (newBudget: number) => void;
  /** Log new expense */
  onLogExpenseClick?: () => void;
  /** Trip ID */
  tripId?: string;
}

/**
 * CompactBudgetSnapshot
 *
 * Displays a compact summary of the trip's budget, total expenses, and remaining budget.
 *
 * @module features/budget/organisms/CompactBudgetSnapshot
 */
export function CompactBudgetSnapshot({
  targetBudget,
  totalPlanned,
  totalSpent,
  currency = 'USD',
  asCard = true,
  canEdit = false,
  isEditing = false,
  onEditToggle,
  onSave,
  onLogExpenseClick,
  tripId,
}: CompactBudgetSnapshotProps) {
  const remaining = targetBudget - totalSpent;
  const percentUsed = targetBudget > 0 ? Math.min(100, Math.round((totalSpent / targetBudget) * 100)) : 0;

  const content = (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Budget</span>
        <span>{formatCurrency(targetBudget, currency)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Planned</span>
        <span>{formatCurrency(totalPlanned, currency)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Spent</span>
        <span>{formatCurrency(totalSpent, currency)}</span>
      </div>
      <div className="flex items-center justify-between text-xs font-medium">
        <span>Remaining</span>
        <span className={remaining < 0 ? 'text-red-500' : 'text-green-600'}>
          {formatCurrency(remaining, currency)}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded mt-1">
        <div
          className={`h-2 rounded ${percentUsed < 90 ? 'bg-green-400' : percentUsed < 100 ? 'bg-yellow-400' : 'bg-red-400'}`}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>
    </div>
  );

  if (asCard) {
    return (
      <div className="rounded-lg border bg-background shadow-sm p-3 w-full max-w-xs">
        {content}
      </div>
    );
  }
  return content;
}

export default CompactBudgetSnapshot; 