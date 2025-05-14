import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // Brand color variants
        'travel-purple': 'border-transparent bg-travel-purple text-travel-purple-foreground',
        'travel-blue': 'border-transparent bg-travel-blue text-travel-blue-foreground',
        'travel-pink': 'border-transparent bg-travel-pink text-travel-pink-foreground',
        'travel-yellow': 'border-transparent bg-travel-yellow text-travel-yellow-foreground',
        'travel-mint': 'border-transparent bg-travel-mint text-travel-mint-foreground',
        'travel-peach': 'border-transparent bg-travel-peach text-travel-peach-foreground',
        // Status variants
        success: 'border-transparent bg-emerald-100 text-emerald-800',
        warning: 'border-transparent bg-amber-100 text-amber-800',
        info: 'border-transparent bg-blue-100 text-blue-800',
        error: 'border-transparent bg-red-100 text-red-800',
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
      radius: 'full',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component with design system variants.
 *
 * @example
 * <Badge variant="travel-purple" radius="md">Insider</Badge>
 */
function Badge({ className, variant, radius, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, radius }), className)} {...props} />;
}

export { Badge, badgeVariants };
