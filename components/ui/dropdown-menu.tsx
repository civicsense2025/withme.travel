/**
 * DropdownMenu (Molecule)
 *
 * A themeable, accessible dropdown menu component with trigger, content, items, label, separator, and group.
 *
 * @module ui/molecules
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownMenuProps {
  children?: React.ReactNode;
  options?: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export function DropdownMenu({ children, options, value, onChange }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If options are provided, render a simplified dropdown
  if (options) {
    const selectedOption = options.find(option => option.value === value);
    
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <span>{selectedOption?.label || 'Select option'}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-sm">
            {options.map((option) => (
              <div
                key={option.value}
                className="cursor-pointer px-3 py-2 hover:bg-muted"
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Otherwise render children (for composable usage)
  return <>{children}</>;
}

export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}
export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  // asChild is handled by wrapper components, but we keep it for compatibility
  return <>{children}</>;
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
  children: React.ReactNode;
}
export function DropdownMenuContent({
  align = 'start',
  className,
  children,
  ...props
}: DropdownMenuContentProps) {
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

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asChild?: boolean;
}
export function DropdownMenuItem({ className, children, asChild, ...props }: DropdownMenuItemProps) {
  // asChild is handled by wrapper components, but we keep it for compatibility
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

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}
export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      className={cn('px-2 py-1 text-xs font-semibold text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}
export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return <div className={cn('my-1 h-px bg-muted', className)} {...props} />;
}

export interface DropdownMenuGroupProps {
  children: React.ReactNode;
}
export function DropdownMenuGroup({ children }: DropdownMenuGroupProps) {
  return <div className="space-y-1">{children}</div>;
} 