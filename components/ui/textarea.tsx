import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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

export interface TextareaProps
  extends React.ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {}

/**
 * Textarea component with design system variants.
 *
 * @example
 * <Textarea variant="travel-purple" radius="lg" />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, radius, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, radius, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
