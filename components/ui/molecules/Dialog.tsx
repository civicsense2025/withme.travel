import React from 'react';
import { cn } from '@/lib/utils';

// Root dialog component
export interface DialogProps {
  children: React.ReactNode;
  className?: string;
}

export const Dialog = ({ children, className }: DialogProps) => {
  return (
    <div className={cn('dialog', className)}>
      {children}
    </div>
  );
};

// Dialog trigger component
export interface DialogTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('dialog-trigger', className)}>
      {children}
    </div>
  );
};

// Dialog content component
export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('dialog-content', className)}>
      {children}
    </div>
  );
};

// Dialog header component
export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('dialog-header', className)}>
      {children}
    </div>
  );
};

// Dialog title component
export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ 
  children, 
  className 
}) => {
  return (
    <h2 className={cn('dialog-title', className)}>
      {children}
    </h2>
  );
};

// Dialog description component
export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('dialog-description', className)}>
      {children}
    </div>
  );
};

// Dialog footer component
export interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('dialog-footer', className)}>
      {children}
    </div>
  );
};
