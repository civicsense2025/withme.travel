/**
 * ItineraryDayHeader
 *
 * Header component for displaying day titles in the itinerary
 *
 * @module itinerary/atoms
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ItineraryDayHeaderProps {
  /** Title text to display (e.g., "Day 1") */
  title: string;
  /** Optional date string to display alongside the title */
  date?: string;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryDayHeader({
  title,
  date,
  className,
}: ItineraryDayHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1 mb-4', className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {date && (
        <p className="text-sm text-muted-foreground">{date}</p>
      )}
    </div>
  );
} 