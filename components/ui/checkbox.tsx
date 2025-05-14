'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer shrink-0 border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm',
  {
    variants: {
      variant: {
        default:
          'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'travel-purple':
          'border-travel-purple data-[state=checked]:bg-travel-purple data-[state=checked]:text-travel-purple-foreground',
        'travel-blue':
          'border-travel-blue data-[state=checked]:bg-travel-blue data-[state=checked]:text-travel-blue-foreground',
        'travel-pink':
          'border-travel-pink data-[state=checked]:bg-travel-pink data-[state=checked]:text-travel-pink-foreground',
        'travel-yellow':
          'border-travel-yellow data-[state=checked]:bg-travel-yellow data-[state=checked]:text-travel-yellow-foreground',
        'travel-mint':
          'border-travel-mint data-[state=checked]:bg-travel-mint data-[state=checked]:text-travel-mint-foreground',
        'travel-peach':
          'border-travel-peach data-[state=checked]:bg-travel-peach data-[state=checked]:text-travel-peach-foreground',
        success:
          'border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white',
        warning:
          'border-amber-400 data-[state=checked]:bg-amber-400 data-[state=checked]:text-amber-900',
        info: 'border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white',
        error: 'border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /** Label for the checkbox shown to screen readers */
  ariaLabel?: string;
  /**
   * Descriptive text for screen readers about the purpose of this checkbox
   * Should be used when the checkbox's purpose isn't clear from context
   */
  ariaDescription?: string;
}

/**
 * Accessible Checkbox component with design system variants.
 * Uses Radix UI's Checkbox primitive with improved accessibility.
 *
 * @example
 * <Checkbox variant="travel-purple" size="lg" />
 *
 * @example
 * <div className="flex items-center space-x-2">
 *   <Checkbox
 *     id="terms"
 *     ariaLabel="Accept terms and conditions"
 *     variant="travel-blue"
 *   />
 *   <label
 *     htmlFor="terms"
 *     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
 *   >
 *     Accept terms and conditions
 *   </label>
 * </div>
 */
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, variant, size, ariaLabel, ariaDescription, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxVariants({ variant, size, className }))}
      aria-label={ariaLabel}
      aria-description={ariaDescription}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
        aria-hidden="true"
      >
        <Check className={size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
