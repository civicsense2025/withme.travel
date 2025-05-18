/**
 * Destination Detail
 * 
 * Displays comprehensive information about a destination including image, ratings, and features
 * 
 * @module destinations/organisms
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DestinationImage } from '../atoms/DestinationImage';
import { 
  DestinationHeader, 
  DestinationMetaBadges,
  DestinationRatingsCard,
  DestinationHighlightsGrid
} from '../molecules';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationDetailProps {
  /** Destination data */
  destination: {
    id: string;
    name?: string;
    city?: string | null;
    country?: string | null;
    continent?: string;
    description?: string | null;
    byline?: string | null;
    highlights?: string[] | string | null;
    image_url?: string | null;
    emoji?: string | null;
    best_season?: string;
    cuisine_rating?: number;
    nightlife_rating?: number;
    cultural_attractions?: number;
    outdoor_activities?: number;
    beach_quality?: number;
    avg_cost_per_day?: number;
    safety_rating?: number;
    image_metadata?: {
      alt_text?: string;
      attribution?: string;
      attributionHtml?: string;
      photographer_name?: string;
      photographer_url?: string;
      source?: string;
      source_id?: string;
      url?: string;
    };
  };
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationDetail({
  destination,
  className,
}: DestinationDetailProps) {
  const {
    name,
    city,
    country,
    continent,
    description,
    byline,
    highlights,
    image_url,
    emoji,
    best_season,
    cuisine_rating,
    nightlife_rating,
    cultural_attractions,
    outdoor_activities,
    beach_quality,
    avg_cost_per_day,
    safety_rating,
    image_metadata,
  } = destination;

  const displayName = name || city || '';

  // Fallback for image if not available
  const imageUrl = (() => {
    if (image_url) {
      return image_url.startsWith('/') ? image_url : `/${image_url}`;
    }
    const slug = displayName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    return `/destinations/${slug}.jpg`;
  })();

  return (
    <div className={cn("space-y-8", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Image and basic info */}
        <div>
          <DestinationImage
            imageUrl={imageUrl}
            destinationName={displayName}
            country={country}
            imageMetadata={image_metadata}
            aspectRatio="aspect-[4/3]"
            className="rounded-xl overflow-hidden mb-4"
          />
          
          <DestinationMetaBadges
            continent={continent}
            bestSeason={best_season}
            avgCostPerDay={avg_cost_per_day}
            className="mb-4"
          />
          
          <Card>
            <DestinationHeader
              name={displayName}
              country={country}
              emoji={emoji}
            />
            <CardContent>
              {description && <p className="text-muted-foreground mb-4">{description}</p>}
              {byline && <p className="text-sm italic">{byline}</p>}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Ratings and features */}
        <div className="space-y-6">
          {/* Ratings section */}
          <DestinationRatingsCard
            cuisineRating={cuisine_rating}
            nightlifeRating={nightlife_rating}
            culturalAttractions={cultural_attractions}
            outdoorActivities={outdoor_activities}
            beachQuality={beach_quality}
            safetyRating={safety_rating}
          />
          
          {/* Highlights grid */}
          <DestinationHighlightsGrid
            highlights={highlights}
            beachQuality={beach_quality}
            nightlifeRating={nightlife_rating}
          />
        </div>
      </div>
    </div>
  );
} 