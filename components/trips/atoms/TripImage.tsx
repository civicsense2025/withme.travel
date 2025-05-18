/**
 * Trip Image
 * 
 * Displays an image for a trip with optional gradient overlay and badge
 * 
 * @module trips/atoms
 */

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface TripImageProps {
  /** URL of the image to display */
  imageUrl: string;
  /** Name of the trip for alt text */
  tripName: string;
  /** Whether to show a gradient overlay */
  showGradient?: boolean;
  /** CSS class for aspect ratio */
  aspectRatio?: string;
  /** Whether to prioritize loading (for LCP images) */
  priority?: boolean;
  /** Whether the trip is public (to show badge) */
  isPublic?: boolean;
  /** Additional CSS class name */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TripImage({
  imageUrl,
  tripName,
  showGradient = true,
  aspectRatio = 'aspect-[4/3]',
  priority = false,
  isPublic,
  className,
}: TripImageProps) {
  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        aspectRatio,
        className
      )}
    >
      {/* Main image */}
      <Image
        src={imageUrl}
        alt={`Cover image for ${tripName}`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      />
      
      {/* Gradient overlay */}
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-gray-900/5" />
      )}
      
      {/* Privacy badge - only shown if isPublic is defined */}
      {isPublic !== undefined && (
        <div className="absolute top-2 right-2">
          <Badge 
            variant={isPublic ? "outline" : "secondary"}
            className={cn(
              "text-xs font-normal",
              isPublic 
                ? "border-white/50 text-white bg-white/10 backdrop-blur-sm" 
                : "border-gray-300/50 bg-white/80 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300"
            )}
          >
            {isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
      )}
    </div>
  );
} 