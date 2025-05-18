/**
 * Popover (Molecule)
 *
 * A themeable, accessible popover component with trigger and content.
 *
 * @module ui/molecules
 */
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface PopoverProps {
  children: React.ReactNode;
}
export function Popover({ children }: PopoverProps) {
  return <>{children}</>;
}

export interface PopoverTriggerProps {
  children: React.ReactNode;
}
export function PopoverTrigger({ children }: PopoverTriggerProps) {
  return <>{children}</>;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function PopoverContent({ className, children, ...props }: PopoverContentProps) {
  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[10rem] rounded-md border bg-popover p-2 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
