/**
 * Header Actions
 * 
 * A container for action buttons in page and section headers
 * 
 * @module ui/atoms/header
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface HeaderActionsProps {
  /** The action buttons to display */
  children: React.ReactNode;
  /** Whether to center the actions */
  centered?: boolean;
  /** Additional CSS class name */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * A container for action buttons in page headers
 */
export function HeaderActions({ children, centered = false, className }: HeaderActionsProps) {
  return (
    <div
      className={cn(
        "mt-4 md:mt-0",
        centered ? "flex justify-center" : "flex justify-start md:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
} 