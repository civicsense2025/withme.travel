/**
 * Tooltip (Molecule)
 *
 * A themeable, accessible tooltip component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  children: React.ReactNode;
}
export function Tooltip({ children }: TooltipProps) {
  return <>{children}</>;
}

export interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}
export function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
  // If asChild is true, we want to clone the children to avoid wrapping them in additional elements
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children);
  }
  return <>{children}</>;
}

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  asChild?: boolean;
}
export function TooltipContent({ className, children, side = 'top', asChild, ...props }: TooltipContentProps) {
  // If asChild is true, we want to clone the children to avoid wrapping them in additional elements
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children);
  }
  
  return (
    <div
      className={cn(
        'absolute z-50 rounded bg-black text-white px-2 py-1 text-xs shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TooltipProviderProps {
  children: React.ReactNode;
}
export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}
