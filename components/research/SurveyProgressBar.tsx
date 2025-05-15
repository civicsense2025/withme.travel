/**
 * SurveyProgressBar
 * 
 * A visual indicator of progress through a multi-step survey,
 * showing completed steps and remaining steps.
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export interface SurveyProgressBarProps {
  /** Current progress value (0-100) */
  value: number;
  /** Optional step information to display */
  steps?: number;
  /** Current step (1-based) */
  currentStep?: number;
  /** Optional class name for custom styling */
  className?: string;
  /** Whether to show step text (e.g., "Step 2 of 5") */
  showStepText?: boolean;
  /** Variant of the progress bar */
  variant?: 'default' | 'success' | 'info';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SurveyProgressBar({
  value,
  steps,
  currentStep,
  className,
  showStepText = true,
  variant = 'default'
}: SurveyProgressBarProps) {
  // Ensure value is between 0-100
  const safeValue = Math.max(0, Math.min(100, value));
  
  // Determine variant-based styling
  const variantClasses = {
    default: '',
    success: 'bg-green-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={cn('h-full bg-primary rounded-full')}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          aria-label="Survey progress"
        />
      </div>
      
      {showStepText && steps && currentStep && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {steps}
          </span>
          <span>{safeValue}% Complete</span>
        </div>
      )}
    </div>
  );
} 