/**
 * Toast (Molecule)
 *
 * A themeable, accessible toast notification component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

export interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <ToastPrimitives.Provider swipeDirection="right">
      {children}
      <ToastPrimitives.Viewport className="fixed bottom-0 right-0 z-[100] flex flex-col p-6 gap-2" />
    </ToastPrimitives.Provider>
  );
}

export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  className?: string;
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export function Toast({
  className,
  variant = 'default',
  children,
  ...props
}: ToastProps) {
  return (
    <ToastPrimitives.Root
      className={cn(
        "border border-border p-4 rounded-md bg-background shadow-md",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full fixed z-50 grid gap-1 w-full sm:max-w-sm",
        variant === 'destructive' && "border-red-200 bg-red-50 text-red-900",
        className
      )}
      {...props}
    >
      {children}
    </ToastPrimitives.Root>
  )
}

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action ref={ref} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none", className)} {...props} />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close ref={ref} className={cn("absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2", className)} toast-close="" {...props} />
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
