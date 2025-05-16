/**
 * TaskAddButton provides a button to create new tasks
 */

import { Button, ButtonProps } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskAddButtonProps extends Omit<ButtonProps, 'children'> {
  /** Label for the button */
  label?: string;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Handler for when the button is clicked */
  onClick: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Button component for adding new tasks
 */
export function TaskAddButton({
  label = 'New Task',
  showIcon = true,
  onClick,
  className,
  ...props
}: TaskAddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {showIcon && <PlusCircle size={16} />}
      <span>{label}</span>
    </Button>
  );
} 