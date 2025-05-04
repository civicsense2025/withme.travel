import { Destination } from '../constants';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import DestinationCard from './DestinationCard';
import { Button } from '@/components/ui/button';

interface DestinationsCarouselProps {
  destinations: Destination[];
  maxVisible?: number;
  onViewAll?: () => void;
}

export function DestinationsCarousel({ destinations, maxVisible = 6, onViewAll }: DestinationsCarouselProps) {
  const showViewAll = destinations.length > maxVisible;
  const visibleDestinations = showViewAll ? destinations.slice(0, maxVisible) : destinations;

  return (
    <div className="relative">
      <Carousel className="w-full" opts={{ align: 'start', loop: false }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {visibleDestinations.map((destination, index) => (
            <CarouselItem 
              key={destination.id} 
              className="pl-2 md:pl-4 basis-72 max-w-xs"
              data-index={index} // For selective rendering optimization
            >
              <DestinationCard destination={destination} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {destinations.length > 3 && (
          <>
            <CarouselPrevious className="left-0 -translate-x-1/2" />
            <CarouselNext className="right-0 translate-x-1/2" />
          </>
        )}
      </Carousel>
      {showViewAll && onViewAll && (
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" onClick={onViewAll}>
            View all {destinations.length}
          </Button>
        </div>
      )}
    </div>
  );
} 