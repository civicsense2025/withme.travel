/**
 * Destination Ratings Card
 * 
 * Displays a collection of ratings for various aspects of a destination
 * 
 * @module destinations/molecules
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { DestinationRating } from '../atoms/DestinationRating';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationRatingsCardProps {
  /** Cuisine quality rating */
  cuisineRating?: number;
  /** Nightlife quality rating */
  nightlifeRating?: number;
  /** Cultural attractions rating */
  culturalAttractions?: number;
  /** Outdoor activities rating */
  outdoorActivities?: number;
  /** Beach quality rating */
  beachQuality?: number;
  /** Safety rating */
  safetyRating?: number;
  /** Additional CSS classes */
  className?: string;
  /** Card title */
  title?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationRatingsCard({
  cuisineRating,
  nightlifeRating,
  culturalAttractions,
  outdoorActivities,
  beachQuality,
  safetyRating,
  className,
  title = "Destination Ratings",
}: DestinationRatingsCardProps) {
  // Check if we have any ratings to display
  const hasRatings = 
    cuisineRating !== undefined ||
    nightlifeRating !== undefined ||
    culturalAttractions !== undefined ||
    outdoorActivities !== undefined ||
    beachQuality !== undefined ||
    safetyRating !== undefined;

  if (!hasRatings) {
    return null;
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cuisineRating !== undefined && (
          <DestinationRating label="Cuisine" value={cuisineRating} />
        )}
        {nightlifeRating !== undefined && (
          <DestinationRating label="Nightlife" value={nightlifeRating} />
        )}
        {culturalAttractions !== undefined && (
          <DestinationRating label="Cultural Attractions" value={culturalAttractions} />
        )}
        {outdoorActivities !== undefined && (
          <DestinationRating label="Outdoor Activities" value={outdoorActivities} />
        )}
        {beachQuality !== undefined && (
          <DestinationRating label="Beach Quality" value={beachQuality} />
        )}
        {safetyRating !== undefined && (
          <DestinationRating label="Safety" value={safetyRating} />
        )}
      </CardContent>
    </Card>
  );
} 