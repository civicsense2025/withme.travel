/**
 * Destination Highlights Grid
 * 
 * Displays a grid of destination features and highlights
 * 
 * @module destinations/molecules
 */

import React from 'react';
import { Utensils, Music, Camera, Waves } from 'lucide-react';
import { DestinationFeature } from './DestinationFeature';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationHighlightsGridProps {
  /** Array of highlight text items */
  highlights?: string[] | string | null;
  /** Beach quality rating */
  beachQuality?: number | null;
  /** Nightlife rating */
  nightlifeRating?: number | null;
  /** Additional CSS classes */
  className?: string;
  /** Section title */
  title?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationHighlightsGrid({
  highlights,
  beachQuality,
  nightlifeRating,
  className,
  title = "Highlights",
}: DestinationHighlightsGridProps) {
  // Process highlights array or string into individual items
  const highlightItems = (() => {
    if (!highlights) return [];
    if (typeof highlights === 'string') {
      return highlights.split(',').map((h) => h.trim());
    }
    return highlights;
  })();

  // If no highlights and no good ratings for beaches or nightlife, don't render
  if (highlightItems.length === 0 && 
      (!beachQuality || beachQuality <= 3.5) && 
      (!nightlifeRating || nightlifeRating <= 3.5)) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DestinationFeature
          title="Local Cuisine"
          description="Experience authentic local dishes and flavors"
          icon={<Utensils className="h-5 w-5" />}
          accentColor="bg-amber-500"
        />
        <DestinationFeature
          title="Cultural Experiences"
          description="Discover local traditions and customs"
          icon={<Camera className="h-5 w-5" />}
          accentColor="bg-purple-500"
        />
        {beachQuality && beachQuality > 3.5 && (
          <DestinationFeature
            title="Beautiful Beaches"
            description="Relax on stunning coastal areas"
            icon={<Waves className="h-5 w-5" />}
            accentColor="bg-blue-500"
          />
        )}
        {nightlifeRating && nightlifeRating > 3.5 && (
          <DestinationFeature
            title="Vibrant Nightlife"
            description="Enjoy the local bars, clubs and entertainment"
            icon={<Music className="h-5 w-5" />}
            accentColor="bg-pink-500"
          />
        )}
      </div>
    </div>
  );
} 