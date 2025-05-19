/**
 * RelatedItinerariesWidget
 * 
 * Displays a collection of itineraries that are related to the current destination.
 * 
 * @module features/destinations/organisms
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface Itinerary {
  id: string;
  title: string;
  slug: string;
  image_url?: string;
  description?: string;
  duration_days?: number;
  view_count?: number;
  destination?: string;
}

export interface RelatedItinerariesWidgetProps {
  /** The ID of the destination to show related itineraries for */
  destinationId: string;
  /** Related itineraries to display */
  itineraries?: Itinerary[];
  /** Whether the itineraries are currently loading */
  isLoading?: boolean;
  /** Maximum number of itineraries to display */
  limit?: number;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RelatedItinerariesWidget({
  destinationId,
  itineraries = [],
  isLoading = false,
  limit = 3,
  className = '',
}: RelatedItinerariesWidgetProps) {
  const displayItineraries = itineraries.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Related Itineraries</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayItineraries.length > 0 ? (
          <div className="space-y-4">
            {displayItineraries.map((itinerary) => (
              <Link 
                href={`/itineraries/${itinerary.slug}`} 
                key={itinerary.id}
                className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {itinerary.image_url ? (
                    <Image
                      src={itinerary.image_url}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
                    {itinerary.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {itinerary.duration_days 
                      ? `${itinerary.duration_days} day${itinerary.duration_days > 1 ? 's' : ''}` 
                      : 'Flexible duration'}
                    {itinerary.view_count !== undefined && ` • ${itinerary.view_count} views`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No related itineraries found</p>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-100 text-right">
          <Link 
            href={`/destinations/${destinationId}/itineraries`}
            className="text-sm text-primary hover:underline font-medium"
          >
            View all itineraries
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default RelatedItinerariesWidget;
