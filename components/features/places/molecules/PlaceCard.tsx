/**
 * PlaceCard
 * 
 * Card component for displaying place information
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceCategory, PlaceAddress, PlaceRating } from '../atoms';
import type { Place } from '@/types/places';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceCardProps {
  /** Place data to display */
  place: Place;
  /** Whether the card should take full width */
  fullWidth?: boolean;
  /** Whether to show the place image */
  showImage?: boolean;
  /** Whether to show the place address */
  showAddress?: boolean;
  /** Whether to show the place rating */
  showRating?: boolean;
  /** Whether to show the place category */
  showCategory?: boolean;
  /** Whether to show the place website link */
  showWebsite?: boolean;
  /** Handler for when the card is clicked */
  onClick?: (place: Place) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to apply hover effects */
  interactive?: boolean;
  /** Whether to show a compact version of the card */
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card component for displaying place information
 */
export function PlaceCard({
  place,
  fullWidth = false,
  showImage = true,
  showAddress = true,
  showRating = true,
  showCategory = true,
  showWebsite = false,
  onClick,
  className = '',
  interactive = true,
  compact = false,
}: PlaceCardProps) {
  // Handle card click
  const handleClick = () => {
    if (interactive && onClick) {
      onClick(place);
    }
  };

  // Prepare fallback image
  const imageSrc = place.cover_image_url || 
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60';

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm',
        fullWidth ? 'w-full' : 'max-w-xs',
        interactive && 'transition-all duration-200 hover:shadow-md',
        interactive && onClick && 'cursor-pointer',
        compact ? 'p-2' : 'p-0',
        className
      )}
      onClick={handleClick}
    >
      {/* Image */}
      {showImage && (
        <div className={cn(
          'relative overflow-hidden',
          compact ? 'h-32 rounded-md' : 'h-48'
        )}>
          <Image
            src={imageSrc}
            alt={place.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'flex flex-col',
        compact ? 'mt-2 gap-1' : 'p-4 gap-2'
      )}>
        {/* Header with name and category */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            'font-medium text-gray-900',
            compact ? 'text-sm' : 'text-lg'
          )}>
            {place.name}
          </h3>
          
          {showCategory && place.category && (
            <PlaceCategory 
              category={place.category} 
              variant={compact ? 'text' : 'badge'}
              showLabel={!compact}
              iconSize={compact ? 16 : 18}
            />
          )}
        </div>

        {/* Place rating */}
        {showRating && place.rating && (
          <PlaceRating 
            rating={place.rating} 
            count={place.rating_count}
            starSize={compact ? 14 : 16}
          />
        )}

        {/* Address */}
        {showAddress && place.address && (
          <PlaceAddress 
            address={place.address} 
            maxLength={compact ? 40 : 60}
            iconSize={compact ? 14 : 16}
          />
        )}

        {/* Website link */}
        {showWebsite && place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} className="mr-1" />
            Visit website
          </a>
        )}
      </div>
    </div>
  );
}

export default PlaceCard; 