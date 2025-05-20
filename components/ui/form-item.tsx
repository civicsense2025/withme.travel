import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      />
    );
  }
);

FormItem.displayName = 'FormItem'; 