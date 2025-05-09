'use client';

import { ExternalLink, Clock, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { appendViatorAffiliate, trackViatorLinkClick } from '@/utils/api/viator';
import { DisplayItineraryItem } from '@/types/itinerary';

interface ViatorItineraryItemProps {
  item: DisplayItineraryItem;
  className?: string;
}

export function ViatorItineraryItem({ item, className = '' }: ViatorItineraryItemProps) {
  // Extract Viator-specific data from the item
  const viatorData = item.data?.source === 'viator' ? item.data : null;
  
  // If this isn't a Viator item, don't render our special component
  if (!viatorData) {
    return null;
  }
  
  const handleBookClick = async () => {
    if (!item.url) return;
    
    const affiliateUrl = appendViatorAffiliate(item.url);
    
    // Track the click
    await trackViatorLinkClick(affiliateUrl, {
      productCode: viatorData.productCode,
      tripId: item.trip_id,
      pageContext: 'itinerary_item',
    });
    
    // Open the Viator page in a new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className={`rounded-lg border border-border bg-surface-light p-4 dark:bg-surface-light/10 ${className}`}>
      <div className="flex gap-4">
        {/* Image */}
        {viatorData.imageUrl && (
          <div className="relative aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={viatorData.imageUrl}
              alt={item.title || 'Tour image'}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-primary-text">{item.title}</h3>
              
              {item.description && (
                <p className="mt-1 text-sm text-secondary-text">{item.description}</p>
              )}
            </div>
            
            {viatorData.price && (
              <Badge className="bg-accent-purple text-white dark:bg-accent-purple/90">
                {viatorData.price}
              </Badge>
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-text">
            {viatorData.duration && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{viatorData.duration}</span>
              </div>
            )}
            
            {viatorData.rating && (
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{viatorData.rating.toFixed(1)}</span>
                {viatorData.reviewCount && (
                  <span className="text-muted-foreground">({viatorData.reviewCount})</span>
                )}
              </div>
            )}
            
            {item.address && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{item.address}</span>
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <Button 
            size="sm"
            variant="secondary"
            className="mt-2 bg-accent-purple text-white hover:bg-accent-purple/90 dark:bg-accent-purple/90 dark:text-white"
            onClick={handleBookClick}
          >
            Book on Viator
            <ExternalLink size={14} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
} 