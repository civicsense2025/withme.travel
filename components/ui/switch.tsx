/**
 * Switch (Atom)
 *
 * A themeable, accessible toggle switch component.
 *
 * @module ui/atoms
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether the switch is checked */
  checked?: boolean;
  /** Callback when the switch state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional class name for the switch */
  className?: string;
  /** Label text or element to display next to the switch */
  label?: React.ReactNode;
  /** Position of the label relative to the switch */
  labelPosition?: 'left' | 'right';
}

export function Switch({
  checked,
  onCheckedChange,
  className,
  label,
  labelPosition = 'right',
  disabled,
  ...props
}: SwitchProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };

  const switchElement = (
    <label
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus-within:ring-2 focus-within:ring-primary/50',
        checked ? 'bg-primary' : 'bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow',
          'transform ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
        aria-hidden="true"
      />
    </label>
  );

  if (!label) {
    return switchElement;
  }

  return (
    <div className="flex items-center gap-2">
      {labelPosition === 'left' && (
        <span className={cn('text-sm', disabled && 'opacity-50')}>{label}</span>
      )}
      {switchElement}
      {labelPosition === 'right' && (
        <span className={cn('text-sm', disabled && 'opacity-50')}>{label}</span>
      )}
    </div>
  );
} 