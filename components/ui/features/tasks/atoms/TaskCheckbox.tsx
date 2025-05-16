/**
 * TaskCheckbox for toggling task completion
 */

import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskCheckboxProps {
  /** Whether the task is completed */
  checked: boolean;
  /** Callback when the checkbox is toggled */
  onChange?: (checked: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class names */
  className?: string;
  /** ID for accessibility */
  id?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Styled checkbox component for toggling task completion
 */
export function TaskCheckbox({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  id,
  ariaLabel,
}: TaskCheckboxProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };
  
  // Size mapping
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };
  
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        sizeClasses[size], 
        'rounded-full p-0',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-checked={checked}
      role="checkbox"
      id={id}
      aria-label={ariaLabel}
      type="button"
    >
      {checked ? (
        <CheckCircle2 
          className="text-primary" 
          size={iconSize[size]} 
          aria-hidden="true" 
        />
      ) : (
        <Circle 
          className="text-muted-foreground" 
          size={iconSize[size]} 
          aria-hidden="true" 
        />
      )}
    </Button>
  );
} 