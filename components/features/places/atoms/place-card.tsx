/**
 * PlaceCard Component
 * 
 * Displays a card with place information including name, category, and rating
 */

'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PlaceCardProps } from '@/components/features/places/types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card displaying place information
 */
export function PlaceCard({ place, onClick, className = '' }: PlaceCardProps) {
  const handleClick = () => {
    if (onClick) onClick(place.id);
  };

  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow ${className}`} 
      onClick={handleClick}
    >
      <div className="relative w-full h-36">
        <Image
          src={place.image_url || '/images/place-placeholder.jpg'}
          alt={place.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{place.name}</h3>
        
        <div className="flex items-center gap-2 mt-2">
          {place.category && (
            <Badge variant="outline" className="text-xs">
              {place.category}
            </Badge>
          )}
          
          {place.rating && (
            <div className="flex items-center text-sm text-yellow-500">
              <span className="mr-1">★</span>
              <span>{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {place.address && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
            {place.address}
          </p>
        )}
        
        {place.description && (
          <p className="text-sm mt-2 line-clamp-2">
            {place.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 