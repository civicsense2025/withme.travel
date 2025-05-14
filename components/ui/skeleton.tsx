'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'>;

const skeletonVariants = cva('motion-safe:animate-pulse', {
  variants: {
    color: {
      default: 'bg-muted',
      'travel-purple': 'bg-travel-purple/20',
      'travel-blue': 'bg-travel-blue/20',
      'travel-pink': 'bg-travel-pink/20',
      'travel-yellow': 'bg-travel-yellow/20',
      'travel-mint': 'bg-travel-mint/20',
      'travel-peach': 'bg-travel-peach/20',
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
    color: 'default',
    radius: 'md',
  },
});

export interface SkeletonProps extends DivProps, VariantProps<typeof skeletonVariants> {}

/**
 * Skeleton component with design system variants.
 *
 * @example
 * <Skeleton color="travel-purple" radius="lg" />
 */
function Skeleton({ className, color = 'default', radius = 'md', ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ color, radius, className }))} {...props} />;
}

export { Skeleton };
