import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    />
  )
);

FormMessage.displayName = 'FormMessage'; 