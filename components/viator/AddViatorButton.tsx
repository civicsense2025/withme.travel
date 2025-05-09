'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Palmtree } from 'lucide-react';
import { ViatorExperienceSearchDialog } from './ViatorExperienceSearchDialog';
import { ViatorExperienceProps } from './ViatorExperienceCard';

interface AddViatorButtonProps {
  tripId: string;
  destinationName?: string;
  destinationId?: string;
  onExperienceAdd?: (data: {
    title: string;
    description?: string;
    url: string;
    item_type: string;
    address?: string;
    duration?: string;
    data?: Record<string, any>;
  }) => void;
  className?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function AddViatorButton({ 
  tripId, 
  destinationName,
  destinationId,
  onExperienceAdd,
  className = '',
  buttonVariant = 'default'
}: AddViatorButtonProps) {
  const handleAddToItinerary = (experience: ViatorExperienceProps) => {
    if (onExperienceAdd) {
      // Transform Viator experience data into itinerary item format
      onExperienceAdd({
        title: experience.title,
        description: experience.description,
        url: experience.productUrl, // Use the affiliate URL
        item_type: 'activity',
        address: experience.location,
        // Store more data in the data object
        data: {
          source: 'viator',
          productCode: experience.productCode,
          price: experience.price,
          duration: experience.duration,
          imageUrl: experience.imageUrl,
          rating: experience.rating,
          reviewCount: experience.reviewCount,
        }
      });
    }
  };

  return (
    <ViatorExperienceSearchDialog
      tripId={tripId}
      destinationName={destinationName}
      destinationId={destinationId}
      onAddToItinerary={handleAddToItinerary}
      trigger={
        <Button 
          variant={buttonVariant} 
          size="sm"
          className={className}
        >
          <Palmtree className="mr-2 h-4 w-4" />
          Find Tours & Activities
        </Button>
      }
    />
  );
} 