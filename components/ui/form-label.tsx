import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);

FormLabel.displayName = 'FormLabel'; 