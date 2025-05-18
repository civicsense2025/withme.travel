/**
 * Dialog (Molecule)
 *
 * A themeable, accessible dialog/modal component with trigger, content, title, description, and footer.
 *
 * @module ui/molecules
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [open, setOpen] = useState(controlledOpen ?? false);
  useEffect(() => {
    if (controlledOpen !== undefined) setOpen(controlledOpen);
  }, [controlledOpen]);
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  return (
    <DialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

export interface DialogTriggerProps {
  children: React.ReactNode;
}
export function DialogTrigger({ children }: DialogTriggerProps) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error('DialogTrigger must be used within Dialog');
  return React.cloneElement(React.Children.only(children) as React.ReactElement, {
    onClick: () => ctx.setOpen(true),
  });
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function DialogContent({ children, className, ...props }: DialogContentProps) {
  const ctx = React.useContext(DialogContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div
      className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/40', className)}
      {...props}
    >
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-lg w-full">{children}</div>
    </div>
  );
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <h2 className={cn('text-lg font-semibold mb-2', className)} {...props} />;
}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <p className={cn('text-muted-foreground mb-4', className)} {...props} />;
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div className={cn('flex justify-end gap-2 mt-4', className)} {...props} />;
}

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mb-4', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';
