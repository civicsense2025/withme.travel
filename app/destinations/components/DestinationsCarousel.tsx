'use client';

import { useEffect } from 'react';
import { Destination } from '../constants';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { DestinationCard } from '@/components/features/destinations/molecules/DestinationCard';
import { Button } from '@/components/ui/button';

interface DestinationsCarouselProps {
  destinations: Destination[];
  maxVisible?: number;
  onViewAll?: () => void;
}

export function DestinationsCarousel({
  destinations,
  maxVisible = 6,
  onViewAll,
}: DestinationsCarouselProps) {
  const showViewAll = destinations.length > maxVisible;
  const visibleDestinations = showViewAll ? destinations.slice(0, maxVisible) : destinations;

  // Add debugging
  useEffect(() => {
    console.log(`[DestinationsCarousel] Rendering ${visibleDestinations.length} destinations`);
    if (visibleDestinations.length > 0) {
      console.log(
        `[DestinationsCarousel] First destination: ${JSON.stringify(visibleDestinations[0])}`
      );
    }
  }, [visibleDestinations]);

  return (
    <div className="relative">
      <Carousel className="w-full" autoScroll={true} scrollInterval={3000}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {visibleDestinations.map((destination, index) => (
            <CarouselItem
              key={destination.id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              data-index={index} // For selective rendering optimization
            >
              <DestinationCard
                destination={{
                  id: destination.id,
                  city: destination.city || null,
                  country: destination.country || null,
                  continent: destination.continent || '',
                  description: destination.description || null,
                  byline: destination.byline || null,
                  highlights: destination.highlights || null,
                  image_url: destination.image_url,
                  emoji: destination.emoji || null,
                  image_metadata: destination.image_metadata || undefined,
                  name: destination.name || undefined,
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {destinations.length > 1 && (
          <>
            <CarouselPrevious className="hidden sm:flex left-0 -translate-x-1/2" />
            <CarouselNext className="hidden sm:flex right-0 translate-x-1/2" />
          </>
        )}
      </Carousel>
      {showViewAll && onViewAll && (
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={onViewAll} className="text-xs sm:text-sm">
            View all {destinations.length}
          </Button>
        </div>
      )}
    </div>
  );
}
