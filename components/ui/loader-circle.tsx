'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A circular loading indicator component with Safari compatibility fixes
 */
export function LoaderCircle({ className, size = 'md', ...props }: LoaderCircleProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin-safari-fix text-muted-foreground')} />
    </div>
  );
}

/**
 * For backward compatibility, also export the Loader2 component
 */
export { Loader2 };
