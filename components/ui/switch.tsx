'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        'travel-purple': 'data-[state=checked]:bg-travel-purple data-[state=unchecked]:bg-input',
        'travel-blue': 'data-[state=checked]:bg-travel-blue data-[state=unchecked]:bg-input',
        'travel-pink': 'data-[state=checked]:bg-travel-pink data-[state=unchecked]:bg-input',
        'travel-yellow': 'data-[state=checked]:bg-travel-yellow data-[state=unchecked]:bg-input',
        'travel-mint': 'data-[state=checked]:bg-travel-mint data-[state=unchecked]:bg-input',
        'travel-peach': 'data-[state=checked]:bg-travel-peach data-[state=unchecked]:bg-input',
        success: 'data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-input',
        warning: 'data-[state=checked]:bg-amber-400 data-[state=unchecked]:bg-input',
        info: 'data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-input',
        error: 'data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-input',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-8 w-16',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

/**
 * Switch component with design system variants.
 *
 * @example
 * <Switch variant="travel-purple" size="lg" />
 */
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, variant, size, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ variant, size, className }))}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  )
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
