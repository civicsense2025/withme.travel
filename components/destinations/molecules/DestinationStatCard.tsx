/**
 * Destination Stat Card
 * 
 * Displays a statistic/metric about a destination with a label and value
 * 
 * @module destinations/molecules
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationStatCardProps {
  /** Label for the statistic */
  label: string;
  /** Value to display (can be a number, string, or JSX element) */
  value: React.ReactNode;
  /** Description or context for the stat */
  description?: string;
  /** Icon to display with the stat */
  icon?: React.ReactNode;
  /** Determines if the value has increased (up), decreased (down), or is neutral */
  trend?: 'up' | 'down' | 'neutral';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationStatCard({
  label,
  value,
  description,
  icon,
  trend = 'neutral',
  size = 'md',
  className,
}: DestinationStatCardProps) {
  // Size-based classes
  const sizeClasses = {
    sm: {
      card: 'p-3',
      icon: 'h-7 w-7',
      value: 'text-2xl',
      label: 'text-xs',
      description: 'text-xs',
    },
    md: {
      card: 'p-4',
      icon: 'h-10 w-10',
      value: 'text-3xl',
      label: 'text-sm',
      description: 'text-xs',
    },
    lg: {
      card: 'p-5',
      icon: 'h-12 w-12',
      value: 'text-4xl',
      label: 'text-base',
      description: 'text-sm',
    },
  };

  // Trend colors
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardContent className={cn("flex flex-col h-full", sizeClasses[size].card)}>
        {icon && (
          <div className="mb-3 text-muted-foreground">
            <div className={cn(sizeClasses[size].icon)}>{icon}</div>
          </div>
        )}
        
        <div className="space-y-1">
          <h3 className={cn("font-medium text-muted-foreground", sizeClasses[size].label)}>
            {label}
          </h3>
          
          <div className={cn("font-bold", sizeClasses[size].value, trendColors[trend])}>
            {value}
          </div>
          
          {description && (
            <p className={cn("text-muted-foreground", sizeClasses[size].description)}>
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 