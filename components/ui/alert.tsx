/**
 * Alert (Molecule)
 *
 * A themeable, accessible alert component with icon, title, and description.
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional icon */
  icon?: React.ReactNode;
  /** Alert title */
  title?: string;
  /** Alert description */
  description?: string;
}

export function Alert({ icon, title, description, className, children, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded border-l-4 border-primary bg-muted p-4',
        className
      )}
      {...props}
    >
      {icon && <div className="mt-1">{icon}</div>}
      <div>
        {title && <div className="font-semibold mb-1">{title}</div>}
        {description && <div className="text-sm text-muted-foreground mb-1">{description}</div>}
        {children}
      </div>
    </div>
  );
}

export const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('font-semibold', className)} {...props} />
  )
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';
