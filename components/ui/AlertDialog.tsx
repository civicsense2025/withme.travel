/**
 * AlertDialog (Molecule)
 *
 * A themeable, accessible alert dialog component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface AlertDialogProps {
  children: React.ReactNode;
}
export function AlertDialog({ children }: AlertDialogProps) {
  return <>{children}</>;
}

export interface AlertDialogTriggerProps {
  children: React.ReactNode;
}
export function AlertDialogTrigger({ children }: AlertDialogTriggerProps) {
  return <>{children}</>;
}

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  return (
    <div
      className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/40', className)}
      {...props}
    >
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-lg w-full">{children}</div>
    </div>
  );
}

export interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <h2 className={cn('text-lg font-semibold mb-2', className)} {...props} />;
}

export interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return <p className={cn('text-muted-foreground mb-4', className)} {...props} />;
}

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return <div className={cn('flex justify-end gap-2 mt-4', className)} {...props} />;
}

export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export function AlertDialogAction({ className, ...props }: AlertDialogActionProps) {
  return <button className={cn('bg-primary text-white rounded px-4 py-2', className)} {...props} />;
}

export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export function AlertDialogCancel({ className, ...props }: AlertDialogCancelProps) {
  return (
    <button className={cn('bg-muted text-foreground rounded px-4 py-2', className)} {...props} />
  );
}
