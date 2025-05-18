/**
 * Header Title
 * 
 * A title component for page and section headers with responsive font sizing
 * 
 * @module ui/atoms/header
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface HeaderTitleProps {
  /** The title text to display */
  children: React.ReactNode;
  /** Whether to center the title */
  centered?: boolean;
  /** Additional CSS class name */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * A responsive page header title component
 */
export function HeaderTitle({ children, centered = false, className }: HeaderTitleProps) {
  return (
    <h1 
      className={cn(
        "text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight",
        centered && "text-center",
        className
      )}
    >
      {children}
    </h1>
  );
} 