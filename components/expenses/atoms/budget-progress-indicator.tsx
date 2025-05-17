/**
 * Budget Progress Indicator
 * 
 * Visualizes budget progress with spent and planned amounts.
 */
import { Progress } from '@/components/ui/progress';
import { cva } from 'class-variance-authority';

export interface BudgetProgressIndicatorProps {
  /**
   * Total amount spent (already paid expenses)
   */
  spent: number;
  /**
   * Total amount planned (future expenses)
   */
  planned: number;
  /**
   * Target budget (maximum amount)
   */
  budget: number;
  /**
   * Optional CSS class for the container
   */
  className?: string;
  /**
   * Show percentage label
   */
  showPercentage?: boolean;
  /**
   * Height of the progress bar in pixels
   */
  height?: number;
}

// Define color variants based on progress percentage
const getProgressColorClass = (percentage: number) => {
  if (percentage < 50) return 'bg-green-500';
  if (percentage < 75) return 'bg-yellow-500';
  if (percentage < 100) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * Displays a progress bar visualizing budget spent and planned vs total budget
 */
export function BudgetProgressIndicator({
  spent,
  planned,
  budget,
  className = '',
  showPercentage = false,
  height = 8
}: BudgetProgressIndicatorProps) {
  // Calculate percentages
  const spentPercentage = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const plannedPercentage = budget > 0 ? Math.min(100 - spentPercentage, (planned / budget) * 100) : 0;
  const totalPercentage = spentPercentage + plannedPercentage;
  const isOverBudget = totalPercentage >= 100;

  // Format the display percentage
  const formattedPercentage = `${Math.round(totalPercentage)}%`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative" style={{ height: `${height}px` }}>
        <div 
          className="w-full h-full rounded-full bg-muted overflow-hidden"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={totalPercentage}
          role="progressbar"
        >
          {/* Spent amount bar */}
          <div 
            className={`h-full absolute left-0 top-0 ${getProgressColorClass(spentPercentage)}`}
            style={{ width: `${spentPercentage}%` }}
            title={`Spent: $${spent.toFixed(2)}`}
          ></div>
          
          {/* Planned amount bar */}
          <div 
            className="h-full absolute top-0 bg-orange-400/80"
            style={{ 
              left: `${spentPercentage}%`,
              width: `${plannedPercentage}%` 
            }}
            title={`Planned: $${planned.toFixed(2)}`}
          ></div>
        </div>
      </div>
      
      {showPercentage && (
        <div className="text-xs text-muted-foreground text-right">
          {formattedPercentage} of budget
          {isOverBudget && <span className="text-destructive ml-1">(Over budget)</span>}
        </div>
      )}
    </div>
  );
} 