/**
 * Destination Feature
 * 
 * Displays a feature highlight of a destination with icon and description
 * 
 * @module destinations/molecules
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationFeatureProps {
  /** Title of the feature */
  title: string;
  /** Description text */
  description: string;
  /** Icon to display */
  icon: React.ReactNode;
  /** Optional accent color class */
  accentColor?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationFeature({
  title,
  description,
  icon,
  accentColor = 'bg-blue-500',
  onClick,
  className,
}: DestinationFeatureProps) {
  return (
    <Card 
      className={cn(
        "border overflow-hidden transition-all duration-300 hover:shadow-md",
        onClick && "cursor-pointer hover:translate-y-[-2px]",
        className
      )}
      onClick={onClick}
    >
      <div className={cn("h-1.5 w-full", accentColor)} />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-md text-white", 
            accentColor
          )}>
            {icon}
          </div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
} 