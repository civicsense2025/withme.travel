/**
 * Destination Header
 * 
 * Displays the destination title, emoji, and location information
 * 
 * @module destinations/molecules
 */

import React from 'react';
import { MapPin } from 'lucide-react';
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationHeaderProps {
  /** Destination name */
  name: string;
  /** Country name */
  country?: string | null;
  /** Emoji representing the destination */
  emoji?: string | null;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationHeader({
  name,
  country,
  emoji,
  className,
}: DestinationHeaderProps) {
  return (
    <CardHeader className={cn("pb-2", className)}>
      <div className="flex items-center">
        {emoji && <span className="mr-2 text-2xl">{emoji}</span>}
        <div>
          <CardTitle className="text-2xl">{name}</CardTitle>
          {country && (
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {country}
            </CardDescription>
          )}
        </div>
      </div>
    </CardHeader>
  );
} 