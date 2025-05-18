/**
 * Form (Molecule)
 *
 * A themeable, accessible form component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}
export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={cn('space-y-4', className)} {...props}>
      {children}
    </form>
  );
}

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function FormField({ children, className, ...props }: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
export function FormLabel({ className, ...props }: FormLabelProps) {
  return <label className={cn('text-sm font-medium', className)} {...props} />;
}

export interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {}
export function FormError({ className, ...props }: FormErrorProps) {
  return <div className={cn('text-sm text-red-600', className)} {...props} />;
}

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props} />
  )
);
FormItem.displayName = 'FormItem';

export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
FormControl.displayName = 'FormControl';

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
FormDescription.displayName = 'FormDescription';
