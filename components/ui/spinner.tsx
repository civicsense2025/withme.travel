'use client';

import { Loader2, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'muted';
  showText?: boolean;
  text?: string;
}

/**
 * A fully SSR-compatible spinner component that prevents hydration mismatches.
 * This should be used for all loading animations throughout the app.
 */
export function Spinner({
  className,
  size = 'md',
  variant = 'default',
  showText = false,
  text = 'Loading...',
  ...props
}: SpinnerProps) {
  // Use isClient state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

  // Only enable client-side features after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    muted: 'text-muted-foreground',
  };

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {/* Use a consistent div structure whether client-side or server-side */}
      <div
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          isClient ? 'animate-spin' : 'opacity-80',
          'rounded-full border-2 border-current border-t-transparent'
        )}
      />
      {showText && <span className="text-sm">{text}</span>}
    </div>
  );
}

/**
 * For backward compatibility, also export Loader2
 */
export { Loader2, LoaderCircle };
