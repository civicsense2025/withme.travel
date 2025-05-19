/**
 * BudgetProgress component that displays a progress bar for budget tracking
 *
 * @module budget/atoms
 */

'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface BudgetProgressProps {
  /** The current amount spent */
  current: number;
  /** The total budget amount */
  total: number;
  /** Additional CSS class names */
  className?: string;
  /** Whether the progress is in a positive state (under budget) */
  isPositive?: boolean;
}

/**
 * Displays a progress bar showing budget spent vs total
 */
export function BudgetProgress({
  current,
  total,
  className = '',
  isPositive = true
}: BudgetProgressProps) {
  // Calculate percentage (cap at 100%)
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  // Determine color based on percentage and isPositive flag
  const getProgressColor = () => {
    if (!isPositive) return 'bg-red-500';
    
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-amber-500';
    if (percentage < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className={`w-full ${className}`}>
      <Progress 
        value={percentage} 
        className={cn("h-2", getProgressColor())}
      />
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>{percentage}% used</span>
        <span>
          {current.toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} / {total.toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      </div>
    </div>
  );
}
