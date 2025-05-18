/**
 * Select (Molecule)
 *
 * A themeable, accessible select dropdown component with trigger, content, items, label, separator, and group.
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps {
  children: React.ReactNode;
}
export function Select({ children }: SelectProps) {
  return <>{children}</>;
}

export interface SelectTriggerProps {
  children: React.ReactNode;
}
export function SelectTrigger({ children }: SelectTriggerProps) {
  return <>{children}</>;
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function SelectContent({ className, children, ...props }: SelectContentProps) {
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

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <div
      className={cn('cursor-pointer rounded px-2 py-1.5 hover:bg-muted', className)}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}
export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <div
      className={cn('px-2 py-1 text-xs font-semibold text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}
export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <div className={cn('my-1 h-px bg-muted', className)} {...props} />;
}

export interface SelectGroupProps {
  children: React.ReactNode;
}
export function SelectGroup({ children }: SelectGroupProps) {
  return <div className="space-y-1">{children}</div>;
}

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}
export function SelectValue({ children, className, ...props }: SelectValueProps) {
  return (
    <span className={cn('font-medium', className)} {...props}>
      {children}
    </span>
  );
}
