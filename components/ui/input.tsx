import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-10 w-full border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        default: 'border-input',
        'travel-purple': 'border-travel-purple focus-visible:ring-travel-purple',
        'travel-blue': 'border-travel-blue focus-visible:ring-travel-blue',
        'travel-pink': 'border-travel-pink focus-visible:ring-travel-pink',
        'travel-yellow': 'border-travel-yellow focus-visible:ring-travel-yellow',
        'travel-mint': 'border-travel-mint focus-visible:ring-travel-mint',
        'travel-peach': 'border-travel-peach focus-visible:ring-travel-peach',
        success: 'border-emerald-500 focus-visible:ring-emerald-500',
        warning: 'border-amber-400 focus-visible:ring-amber-400',
        info: 'border-blue-500 focus-visible:ring-blue-500',
        error: 'border-red-500 focus-visible:ring-red-500',
      },
      radius: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      radius: 'md',
    },
  }
);

export interface InputProps
  extends React.ComponentProps<'input'>,
    VariantProps<typeof inputVariants> {
  /** ID of helper text element that describes this input */
  helperTextId?: string;
  /** Whether this input is in an error state */
  hasError?: boolean;
  /** Whether the input is required */
  required?: boolean;
}

/**
 * Accessible Input component with design system variants.
 *
 * @example
 * <div>
 *   <Label htmlFor="email" id="email-label">Email address</Label>
 *   <Input
 *     id="email"
 *     type="email"
 *     variant="travel-purple"
 *     radius="lg"
 *     aria-labelledby="email-label"
 *     helperTextId="email-help"
 *     required
 *   />
 *   <p id="email-help" className="text-sm text-muted-foreground">We'll never share your email.</p>
 * </div>
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, radius, type, hasError, helperTextId, required, ...props }, ref) => {
    // Combine helper text and error state for aria-describedby
    const getAriaDescribedBy = () => {
      if (props['aria-describedby'] && helperTextId) {
        return `${props['aria-describedby']} ${helperTextId}`;
      }
      if (helperTextId) {
        return helperTextId;
      }
      return props['aria-describedby'];
    };

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: hasError ? 'error' : variant, radius, className }))}
        ref={ref}
        aria-describedby={getAriaDescribedBy()}
        aria-invalid={hasError ? true : undefined}
        aria-required={required ? true : undefined}
        required={required}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
