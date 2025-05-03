'use client';

import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted',
        // Only apply animation when motion is safe and enabled
        'motion-safe:animate-pulse',
        // Allow custom classes to override defaults
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
