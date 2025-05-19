import React from 'react';
import { cn } from '@/lib/utils';

export interface MapPinProps {
  /** Index or number to show on the pin */
  index?: number | string;
  /** Pin color scheme */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success';
  /** Optional additional className */
  className?: string;
  /** Whether the pin is selected */
  isSelected?: boolean;
  /** Whether the pin is disabled */
  disabled?: boolean;
  /** Callback when pin is clicked */
  onClick?: () => void;
  /** Optional pin size */
  size?: 'sm' | 'md' | 'lg';
}

export function MapPin({
  index,
  variant = 'primary',
  className,
  isSelected = false,
  disabled = false,
  onClick,
  size = 'md',
}: MapPinProps) {
  // Define styles based on variant and state
  const variantStyles = {
    default: 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-800',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    danger: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-600 text-white dark:bg-green-500',
  };
  
  const sizeStyles = {
    sm: 'h-5 w-5 text-xs',
    md: 'h-7 w-7 text-sm',
    lg: 'h-9 w-9 text-base',
  };
  
  // Build the pin classes
  const pinClasses = cn(
    'flex items-center justify-center rounded-full font-medium shadow-md transform transition-transform',
    variantStyles[variant],
    sizeStyles[size],
    isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110',
    className
  );

  // CSS for the pin "tail"
  const tailClasses = cn(
    'absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-3 transform rotate-45',
    variantStyles[variant]
  );

  return (
    <div 
      className="relative inline-flex" 
      onClick={disabled ? undefined : onClick}
    >
      <div className={pinClasses}>
        {typeof index !== 'undefined' ? index : null}
      </div>
      <div className={tailClasses} />
    </div>
  );
}