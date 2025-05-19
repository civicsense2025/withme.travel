/**
 * Sheet (Molecule)
 *
 * A themeable, accessible sheet/side panel component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function Sheet({ children }: SheetProps) {
  return <>{children}</>;
}

export interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}
export function SheetTrigger({ children }: SheetTriggerProps) {
  return <>{children}</>;
}

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}
export function SheetContent({ className, children, ...props }: SheetContentProps) {
  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return <h2 className={cn('text-lg font-semibold mb-2', className)} {...props} />;
}

export interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <p className={cn('text-muted-foreground mb-4', className)} {...props} />;
}

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return <div className={cn('flex justify-end gap-2 mt-4', className)} {...props} />;
}

export const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mb-4', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';
