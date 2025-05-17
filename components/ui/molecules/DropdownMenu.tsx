import React from 'react';
import { cn } from '@/lib/utils';

// Root dropdown component
export interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('dropdown', className)}>
      {children}
    </div>
  );
};

// Dropdown trigger component
export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('dropdown-trigger', className)}>
      {children}
    </div>
  );
};

// Dropdown content component
export interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('dropdown-content', className)}>
      {children}
    </div>
  );
};

// Dropdown item component
export interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className,
  onClick
}) => {
  return (
    <div
      className={cn('dropdown-item', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Dropdown separator component
export interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className
}) => {
  return (
    <div className={cn('dropdown-separator', className)} />
  );
};
