/**
 * SurveyProgressBar Component
 *
 * Displays a progress bar and step indicator for multi-step surveys.
 * Used in the user testing survey flow to show current progress.
 *
 * @module components/ui/SurveyProgressBar
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Props for the SurveyProgressBar component
 */
export interface SurveyProgressBarProps {
  /** Current step (1-based) */
  current: number;
  /** Total number of steps */
  total: number;
  /** Optional: Additional className for styling */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Displays a progress bar and step indicator for surveys
 */
export function SurveyProgressBar({ current, total, className = '' }: SurveyProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className={`w-full mb-4 ${className}`.trim()} aria-label="Survey progress" aria-valuenow={current} aria-valuemax={total} aria-valuemin={1} role="progressbar">
      <div className="flex justify-between text-xs mb-1">
        <span>Step {current} of {total}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" aria-hidden="true">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
} 