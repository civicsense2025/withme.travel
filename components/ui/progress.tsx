/**
 * Progress (Atom)
 *
 * A themeable, accessible progress bar component with support for
 * determinate and indeterminate states, labels, and variants.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export type ProgressVariant = 'default' | 'success' | 'info' | 'warning' | 'danger';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressLabelPosition = 'top' | 'inside' | 'bottom' | 'none';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value (0-100) */
  value?: number;
  /** Maximum value */
  max?: number;
  /** Whether to show progress as indeterminate */
  indeterminate?: boolean;
  /** Visual style variant */
  variant?: ProgressVariant;
  /** Progress bar size */
  size?: ProgressSize;
  /** Whether to display value as percentage */
  showValueLabel?: boolean;
  /** Format function for value label */
  formatValueLabel?: (value: number, max: number) => string;
  /** Label for the progress bar */
  label?: React.ReactNode;
  /** Position of the label */
  labelPosition?: ProgressLabelPosition;
  /** Whether to animate value changes */
  animate?: boolean;
  /** Whether to add a striped effect */
  striped?: boolean;
  /** Whether to animate the striped effect */
  animated?: boolean;
  /** Custom track (background) className */
  trackClassName?: string;
  /** Custom fill (foreground) className */
  fillClassName?: string;
  /** Value color override */
  valueColor?: string;
  /** Track color override */
  trackColor?: string;
  /** Whether the progress bar is disabled */
  disabled?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    value = 0,
    max = 100,
    indeterminate = false,
    variant = 'default',
    size = 'md',
    showValueLabel = false,
    formatValueLabel,
    label,
    labelPosition = 'top',
    animate = true,
    striped = false,
    animated = false,
    className,
    trackClassName,
    fillClassName,
    valueColor,
    trackColor,
    disabled = false,
    style,
    ...props
  }, ref) => {
    // Calculate percentage and ensure it's between 0-100
    const percent = Math.min(100, Math.max(0, ((value || 0) / max) * 100));
    
    // Format value label
    const valueLabel = formatValueLabel
      ? formatValueLabel(value || 0, max)
      : `${Math.round(percent)}%`;
    
    // Size classes
    const sizeClasses = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };
    
    // Variant classes
    const variantClasses = {
      default: 'bg-primary text-primary-foreground',
      success: 'bg-green-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-yellow-500 text-black',
      danger: 'bg-red-500 text-white',
    };
    
    // Label inside check - only for md and lg sizes
    const canLabelInside = size === 'md' || size === 'lg';
    const actualLabelPosition = labelPosition === 'inside' && !canLabelInside
      ? 'top'
      : labelPosition;
    
    // Striped pattern
    const stripedClass = striped || animated
      ? 'bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-size-1rem'
      : '';
    
    // Animation classes
    const animationClass = 
      animated ? 'animate-progress-stripes' : 
      indeterminate ? 'animate-progress-indeterminate' : 
      '';
    
    // Custom colors
    const customStyle = {
      '--progress-value-color': valueColor,
      '--progress-track-color': trackColor,
      ...style,
    } as React.CSSProperties;
    
    return (
      <div 
        ref={ref}
        className={cn(
          'w-full',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        style={customStyle}
        {...props}
      >
        {/* Label - top */}
        {label && actualLabelPosition === 'top' && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{label}</span>
            {showValueLabel && (
              <span className="text-sm text-muted-foreground">{valueLabel}</span>
            )}
          </div>
        )}
        
        {/* Progress track */}
        <div 
          className={cn(
            'w-full overflow-hidden rounded-full bg-muted',
            sizeClasses[size],
            trackClassName
          )}
          style={{ backgroundColor: trackColor }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuetext={indeterminate ? undefined : valueLabel}
          aria-busy={indeterminate}
        >
          {/* Progress value */}
          <div
            className={cn(
              'h-full rounded-full transition-all',
              indeterminate ? 'w-1/3' : animate ? 'transition-width duration-500' : '',
              variantClasses[variant],
              stripedClass,
              animationClass,
              fillClassName
            )}
            style={{
              width: indeterminate ? undefined : `${percent}%`,
              backgroundColor: valueColor,
            }}
          >
            {/* Label - inside */}
            {label && actualLabelPosition === 'inside' && canLabelInside && percent > 20 && (
              <div className="h-full px-2 flex items-center justify-between">
                <span className="text-xs font-medium truncate max-w-[80%]">{label}</span>
                {showValueLabel && (
                  <span className="text-xs font-medium ml-auto">{valueLabel}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Label - bottom */}
        {label && actualLabelPosition === 'bottom' && (
          <div className="flex justify-between mt-1">
            <span className="text-sm font-medium">{label}</span>
            {showValueLabel && (
              <span className="text-sm text-muted-foreground">{valueLabel}</span>
            )}
          </div>
        )}
        
        {/* Value only - no label */}
        {!label && showValueLabel && actualLabelPosition !== 'none' && (
          <div className="flex justify-end mt-1">
            <span className="text-sm text-muted-foreground">{valueLabel}</span>
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

// ============================================================================
// SPECIALIZED PROGRESS COMPONENTS
// ============================================================================

export interface CircularProgressProps extends Omit<ProgressProps, 'size'> {
  /** Size in pixels */
  size?: number;
  /** Thickness of the circle */
  thickness?: number;
}

export const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ 
    value = 0, 
    max = 100, 
    size = 40,
    thickness = 4,
    variant = 'default',
    indeterminate = false,
    showValueLabel = false,
    label,
    className,
    disabled = false,
    valueColor,
    trackColor,
    ...props
  }, ref) => {
    // Calculate percentage
    const percent = Math.min(100, Math.max(0, ((value || 0) / max) * 100));
    
    // SVG parameters
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    
    // Variant classes
    const variantClasses = {
      default: 'text-primary',
      success: 'text-green-500',
      info: 'text-blue-500',
      warning: 'text-yellow-500',
      danger: 'text-red-500',
    };
    
    return (
      <div 
        className={cn(
          'inline-flex flex-col items-center justify-center',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
      >
        <svg
          ref={ref}
          className={cn(
            'transform -rotate-90',
            indeterminate && 'animate-spin',
          )}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={indeterminate ? undefined : value}
          {...props}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor || 'currentColor'}
            strokeWidth={thickness}
            className="text-muted opacity-20"
          />
          
          {/* Foreground circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={valueColor || 'currentColor'}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
            strokeLinecap="round"
            className={variantClasses[variant]}
          />
        </svg>
        
        {showValueLabel && (
          <div className="mt-2 text-sm font-medium">
            {indeterminate ? label : `${Math.round(percent)}%`}
          </div>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';