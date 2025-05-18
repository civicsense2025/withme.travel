/**
 * Header Description
 * 
 * A description text component for page and section headers
 * 
 * @module ui/atoms/header
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface HeaderDescriptionProps {
  /** The description text to display */
  children: React.ReactNode;
  /** Whether to center the description */
  centered?: boolean;
  /** Maximum width of the description in characters */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none';
  /** Additional CSS class name */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  'none': ''
};

/**
 * A responsive page header description component
 */
export function HeaderDescription({ 
  children, 
  centered = false, 
  maxWidth = '2xl',
  className 
}: HeaderDescriptionProps) {
  return (
    <p 
      className={cn(
        "text-base md:text-lg lg:text-xl text-muted-foreground",
        maxWidthClasses[maxWidth],
        centered && "text-center mx-auto",
        className
      )}
    >
      {children}
    </p>
  );
} 