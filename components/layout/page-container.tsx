import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  fullWidth?: boolean;
}

export function PageContainer({
  children,
  header,
  className,
  headerClassName,
  contentClassName,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-col min-h-screen', className)}>
      {header && (
        <div
          className={cn(
            'max-w-full bg-background',
            fullWidth ? 'px-0' : 'px-6 md:px-8',
            headerClassName
          )}
        >
          <div className={cn('max-w-screen-2xl mx-auto py-12', fullWidth ? 'w-full' : '')}>
            {header}
          </div>
        </div>
      )}

      <div className={cn('flex-1', fullWidth ? 'px-0' : 'px-6 md:px-8', contentClassName)}>
        <div className={cn('max-w-screen-2xl mx-auto', fullWidth ? 'w-full' : '')}>{children}</div>
      </div>
    </div>
  );
}
