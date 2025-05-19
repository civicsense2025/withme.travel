'use client';

/**
 * RadioGroup (Molecule)
 *
 * A themeable, accessible radio button group component with support
 * for different layouts, card selection, and custom styling.
 *
 * @module ui/molecules
 */
import React, { createContext, useContext, useId } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & CONTEXT
// ============================================================================

type RadioGroupContextValue = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variant?: RadioVariant;
  size?: RadioSize;
  layout?: RadioGroupLayout;
  itemClassName?: string;
};

export type RadioVariant = 'default' | 'outline' | 'card' | 'pill';
export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioGroupLayout = 'vertical' | 'horizontal' | 'grid';

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group name for form submission */
  name: string;
  /** Currently selected value */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Radio group variant */
  variant?: RadioVariant;
  /** Radio group size */
  size?: RadioSize;
  /** Layout direction */
  layout?: RadioGroupLayout;
  /** Whether radio group is disabled */
  disabled?: boolean;
  /** Class name for individual radio items */
  itemClassName?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  disabled = false,
  itemClassName,
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value,
        onChange,
        disabled,
        variant,
        size,
        layout,
        itemClassName,
      }}
    >
      <div 
        role="radiogroup"
        className={cn(
          layout === 'vertical' && 'flex flex-col space-y-2',
          layout === 'horizontal' && 'flex flex-row space-x-4 items-center',
          layout === 'grid' && 'grid grid-cols-2 gap-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

// Hook for accessing radio group context
function useRadioGroupContext() {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }
  return context;
}

// ============================================================================
// RADIO GROUP ITEM COMPONENT
// ============================================================================

export interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Value for this radio item */
  value: string;
  /** Label text */
  label?: React.ReactNode;
  /** Description text shown below label */
  description?: React.ReactNode;
  /** Icon shown with the label */
  icon?: React.ReactNode;
  /** Children for custom rendering */
  children?: React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Custom class name for the radio wrapper */
  className?: string;
  /** Class name for the label */
  labelClassName?: string;
}

export function RadioGroupItem({
  value,
  label,
  description,
  icon,
  children,
  disabled: itemDisabled,
  className,
  labelClassName,
  ...props
}: RadioGroupItemProps) {
  const { 
    name, 
    value: groupValue, 
    onChange, 
    disabled: groupDisabled,
    variant,
    size,
    layout,
    itemClassName 
  } = useRadioGroupContext();
  
  // Generate a unique ID for this radio
  const id = useId();
  
  // Determine if this item is selected
  const isSelected = groupValue === value;
  
  // Combine disabled prop from group and item
  const isDisabled = groupDisabled || itemDisabled;
  
  // Size classes
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Label size classes
  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  // Handle change
  const handleChange = () => {
    if (!isDisabled) {
      onChange(value);
    }
  };
  
  // Render card variant
  if (variant === 'card') {
    return (
      <label
        className={cn(
          'relative flex cursor-pointer rounded-lg border p-4',
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-muted bg-background hover:bg-muted/10',
          isDisabled && 'cursor-not-allowed opacity-60',
          layout === 'grid' && 'flex-col',
          itemClassName,
          className
        )}
      >
        <input
          type="radio"
          name={name}
          id={id}
          value={value}
          checked={isSelected}
          onChange={handleChange}
          disabled={isDisabled}
          className="sr-only"
          aria-checked={isSelected}
          {...props}
        />
        
        <div className={cn(
          layout === 'horizontal' && 'flex flex-row items-center gap-2',
          layout === 'vertical' && 'flex flex-row items-start gap-2',
          layout === 'grid' && 'flex flex-col items-start gap-2'
        )}>
          {variant === 'card' && (
            <div 
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border',
                isSelected
                  ? 'border-primary'
                  : 'border-muted-foreground/30',
                !isDisabled && !isSelected && 'group-hover:border-primary/50'
              )}
            >
              {isSelected && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
          )}
          
          <div className="flex-grow">
            {label && (
              <div className={cn(
                'font-medium',
                labelSizeClasses[size],
                labelClassName
              )}>
                {label}
              </div>
            )}
            
            {description && (
              <div className="text-muted-foreground text-xs mt-1">
                {description}
              </div>
            )}
            
            {children}
          </div>
          
          {icon && <div className="ml-auto">{icon}</div>}
        </div>
      </label>
    );
  }
  
  // Pill variant
  if (variant === 'pill') {
    return (
      <label
        className={cn(
          'inline-flex items-center cursor-pointer',
          itemClassName,
          className
        )}
      >
        <input
          type="radio"
          name={name}
          id={id}
          value={value}
          checked={isSelected}
          onChange={handleChange}
          disabled={isDisabled}
          className="sr-only"
          aria-checked={isSelected}
          {...props}
        />
        
        <div 
          className={cn(
            'flex items-center justify-center rounded-full px-3 py-1 text-sm transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/60',
            isDisabled && 'cursor-not-allowed opacity-60',
          )}
        >
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </div>
      </label>
    );
  }
  
  // Default or outline variant
  return (
    <label
      className={cn(
        'inline-flex items-start gap-2 cursor-pointer',
        isDisabled && 'cursor-not-allowed opacity-60',
        itemClassName,
        className
      )}
    >
      <div className="relative flex items-center">
        <input
          type="radio"
          name={name}
          id={id}
          value={value}
          checked={isSelected}
          onChange={handleChange}
          disabled={isDisabled}
          className="sr-only"
          aria-checked={isSelected}
          {...props}
        />
        
        <div
          className={cn(
            'flex items-center justify-center rounded-full border',
            sizeClasses[size],
            isSelected
              ? 'border-primary'
              : 'border-input',
            !isDisabled && !isSelected && 'hover:border-primary/50',
            variant === 'outline' && 'border-2',
          )}
        >
          {isSelected && (
            <div
              className={cn(
                'rounded-full bg-primary',
                size === 'sm' && 'h-1.5 w-1.5',
                size === 'md' && 'h-2 w-2',
                size === 'lg' && 'h-2.5 w-2.5',
              )}
            />
          )}
        </div>
      </div>
      
      {(label || description || children) && (
        <div 
          className={cn(
            'flex flex-col',
            size === 'sm' && 'pt-0',
            size === 'md' && 'pt-0.5',
            size === 'lg' && 'pt-1',
          )}
        >
          {label && (
            <span className={cn(
              'font-medium',
              labelSizeClasses[size],
              labelClassName
            )}>
              {label}
            </span>
          )}
          
          {description && (
            <span className="text-muted-foreground text-xs mt-1">
              {description}
            </span>
          )}
          
          {children}
        </div>
      )}
    </label>
  );
}

// ============================================================================
// RADIO GROUP LABEL COMPONENT
// ============================================================================

export interface RadioGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a required indicator */
  required?: boolean;
}

export function RadioGroupLabel({
  children,
  className,
  required = false,
  ...props
}: RadioGroupLabelProps) {
  return (
    <div
      className={cn('text-sm font-medium', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </div>
  );
}

// ============================================================================
// RADIO BUTTON GROUP COMPONENT (SPECIALIZED VARIANT)
// ============================================================================

export interface RadioButtonGroupProps extends Omit<RadioGroupProps, 'variant'> {
  /** Options for the button group */
  options: {
    label: React.ReactNode;
    value: string;
    disabled?: boolean;
    icon?: React.ReactNode;
  }[];
  /** Whether to stretch buttons to fill container */
  fullWidth?: boolean;
  /** Button style */
  buttonStyle?: 'solid' | 'outline';
}

export function RadioButtonGroup({
  options,
  fullWidth = false,
  buttonStyle = 'outline',
  size = 'md',
  className,
  ...radioGroupProps
}: RadioButtonGroupProps) {
  const { value } = radioGroupProps;
  
  return (
    <RadioGroup
      {...radioGroupProps}
      variant="default"
      size={size}
      layout="horizontal"
      className={cn(
        'inline-flex p-0.5 rounded-md bg-muted',
        fullWidth && 'w-full',
        className
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-center justify-center rounded-md transition-colors',
            'cursor-pointer text-center',
            size === 'sm' && 'px-2.5 py-1 text-xs',
            size === 'md' && 'px-3 py-1.5 text-sm',
            size === 'lg' && 'px-4 py-2 text-base',
            value === option.value
              ? buttonStyle === 'solid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
            option.disabled && 'opacity-50 cursor-not-allowed',
            fullWidth && 'flex-1'
          )}
        >
          <input
            type="radio"
            name={radioGroupProps.name}
            value={option.value}
            checked={value === option.value}
            onChange={() => !option.disabled && radioGroupProps.onChange(option.value)}
            className="sr-only"
            disabled={option.disabled}
          />
          
          {option.icon && (
            <span className="mr-1.5">{option.icon}</span>
          )}
          
          {option.label}
        </label>
      ))}
    </RadioGroup>
  );
}