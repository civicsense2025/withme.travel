/**
 * Destination Card
 * 
 * A card component displaying a destination with image and details
 * 
 * @module destinations/molecules
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { DestinationImage } from '../atoms/DestinationImage';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationCardProps {
  /** Destination data to display */
  destination: {
    id: string;
    city: string | null;
    country: string | null;
    continent?: string;
    name?: string;
    description?: string | null;
    byline?: string | null;
    highlights?: string[] | string | null;
    image_url?: string | null;
    emoji?: string | null;
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
  /** Click handler for the card */
  onClick?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationCard({
  destination,
  className = '',
  onClick,
}: DestinationCardProps) {
  if (!destination) {
    // Defensive: render nothing or a fallback UI if destination is missing
    return null;
  }
  const { city, country, image_url, emoji, image_metadata, byline, name } = destination;
  const displayName = name || city || '';

  // Fallback for image if not available
  const imageUrl = (() => {
    if (image_url) {
      return image_url.startsWith('/') || image_url.startsWith('http') 
        ? image_url 
        : `/${image_url}`;
    }
    const slug = displayName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    return `/destinations/${slug}.jpg`;
  })();

  return (
    <Card
      className={cn(
        `group bg-transparent border-0 overflow-hidden rounded-xl h-full 
        transition-all duration-500 ease-out
        hover:shadow-xl hover:scale-[1.02]
        relative`,
        className
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Select ${displayName}`}
    >
      <DestinationImage
        imageUrl={imageUrl}
        destinationName={displayName}
        country={country}
        imageMetadata={image_metadata}
        aspectRatio="aspect-[3/4]"
        showGradient={true}
      />
      
      {/* Destination Info - overlaid on the image */}
      <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">{displayName}</h3>
            <p className="text-sm text-white/90 flex items-center">
              {emoji && <span className="mr-1">{emoji}</span>}
              {country}
            </p>
            {byline && <p className="mt-1 text-sm text-white/80">{byline}</p>}
          </div>
        </div>
      </div>
    </Card>
  );
} 