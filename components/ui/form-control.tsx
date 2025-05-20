import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('[&:has(:disabled)]:opacity-50 [&:has(:disabled)]:cursor-not-allowed', className)}
      {...props}
    />
  )
);

FormControl.displayName = 'FormControl'; 