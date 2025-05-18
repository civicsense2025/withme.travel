/**
 * PlaceCard Component
 * 
 * Displays place information in a card format.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PlaceIcon from '../atoms/PlaceIcon';
import { cn } from '@/lib/utils';
import { ExternalLink, Star } from 'lucide-react';
import type { Place } from '@/types/places';

// ============================================================================
// TYPES
// ============================================================================

/**
 * PlaceCard component props
 */
export interface PlaceCardProps {
  /** Place data to display */
  place: Place;
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Handler for when the card is clicked */
  onClick?: (place: Place) => void;
  /** Optional CSS class name */
  className?: string;
  /** Optional compact variant */
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays place information in a card format
 */
export function PlaceCard({
  place,
  clickable = true,
  onClick,
  className,
  compact = false
}: PlaceCardProps) {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick(place);
    }
  };

  // Format the address for display
  const formatAddress = (address?: string) => {
    if (!address) return '';
    
    // Limit address to 50 characters with ellipsis
    return address.length > 50 ? `${address.substring(0, 47)}...` : address;
  };

  // Render rating stars
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center text-yellow-500 mt-1">
        <Star size={16} className="fill-current" />
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card 
      className={cn(
        "place-card border overflow-hidden transition-shadow hover:shadow-md",
        clickable && "cursor-pointer",
        compact ? "max-w-xs" : "w-full",
        className
      )}
      onClick={handleClick}
    >
      {place.image_url && (
        <div className="relative w-full h-32 overflow-hidden">
          <Image
            src={place.image_url}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
          {place.category && (
            <Badge 
              className="absolute top-2 right-2 bg-opacity-75 backdrop-blur-sm"
              variant="secondary"
            >
              {place.category}
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className={compact ? "p-3" : "p-4"}>
        <CardTitle className="flex items-start gap-2">
          <PlaceIcon 
            category={place.category} 
            size={compact ? 18 : 24} 
            className="mt-1 flex-shrink-0"
          />
          <div>
            <span className={cn("font-medium", compact ? "text-base" : "text-lg")}>
              {place.name}
            </span>
            {renderRating(place.rating)}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={compact ? "p-3 pt-0" : "p-4 pt-0"}>
        {place.address && (
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            {formatAddress(place.address)}
          </p>
        )}
        
        {place.description && !compact && (
          <p className="text-sm mt-2 line-clamp-2">
            {place.description}
          </p>
        )}
        
        {place.website && !compact && (
          <a 
            href={place.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-primary mt-3 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} className="mr-1" />
            Visit website
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default PlaceCard; 