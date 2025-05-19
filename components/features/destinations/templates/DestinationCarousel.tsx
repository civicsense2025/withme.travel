/**
 * Destination Carousel
 * 
 * A carousel component for displaying featured or popular destinations
 * 
 * @module destinations/templates
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DestinationCard } from '../molecules/DestinationCard';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationCarouselProps {
  /** Destinations to display in the carousel */
  destinations: any[];
  /** Title for the carousel section */
  title?: string;
  /** Subtitle/description for the carousel */
  subtitle?: string;
  /** URL for the "View All" button */
  viewAllUrl?: string;
  /** Whether to show the "View All" button */
  showViewAll?: boolean;
  /** Whether to auto-play the carousel */
  autoPlay?: boolean;
  /** Interval for auto-play in milliseconds */
  autoPlayInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CLIENT COMPONENT
// ============================================================================

export function DestinationCarousel({
  destinations,
  title = "Featured Destinations",
  subtitle = "Explore our handpicked destinations",
  viewAllUrl = "/destinations",
  showViewAll = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className,
}: DestinationCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle navigation
  const goToSlide = useCallback((index: number) => {
    const newIndex = index < 0 
      ? destinations.length - 1 
      : index >= destinations.length 
        ? 0 
        : index;
    
    setActiveIndex(newIndex);
    
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: newIndex * slideWidth,
        behavior: 'smooth',
      });
    }
  }, [destinations.length]);

  const handlePrev = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  const handleNext = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);

  // Auto-play effect
  React.useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, handleNext]);

  // Handle scroll snap
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    
    const slideWidth = carouselRef.current.offsetWidth;
    const scrollPosition = carouselRef.current.scrollLeft;
    const newIndex = Math.round(scrollPosition / slideWidth);
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex]);

  if (!destinations?.length) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* Navigation buttons */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-md bg-background/80 backdrop-blur-sm"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
      </div>
      
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-md bg-background/80 backdrop-blur-sm"
          onClick={handleNext}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      {/* Carousel container */}
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2 -mx-2"
        onScroll={handleScroll}
      >
        {destinations.map((destination, index) => (
          <div
            key={destination.id || index}
            className="flex-none w-full px-2 snap-start"
          >
            <DestinationCard 
              destination={destination}
              onClick={() => {}}
              className="h-[400px] md:h-[500px] transition-all duration-300 transform"
            />
          </div>
        ))}
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {destinations.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === activeIndex 
                ? "bg-primary w-6" 
                : "bg-muted hover:bg-muted-foreground/50"
            )}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* View all link */}
      {showViewAll && (
        <div className="mt-6 text-right">
          <Button asChild variant="link">
            <Link href={viewAllUrl}>
              View all destinations
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
} 