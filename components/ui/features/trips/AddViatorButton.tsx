'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Palmtree, Plus } from 'lucide-react';
import { ViatorExperienceSearchDialog } from './ViatorExperienceSearchDialog';
import { ViatorExperienceProps } from './ViatorExperienceCard';

interface AddViatorButtonProps {
  tripId: string;
  onAddActivity?: (activityData: any) => void;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AddViatorButton({
  tripId,
  onAddActivity,
  className = '',
  variant = 'default',
  size = 'default',
}: AddViatorButtonProps) {
  const handleAddToItinerary = (experience: ViatorExperienceProps) => {
    if (onAddActivity) {
      // Transform Viator experience data into itinerary item format
      onAddActivity({
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
        },
      });
    }
  };

  return (
    <ViatorExperienceSearchDialog
      tripId={tripId}
      onAddToItinerary={handleAddToItinerary}
      trigger={
        <Button variant={variant} size={size} className={className}>
          <Palmtree className="mr-2 h-4 w-4" />
          Find Tours & Activities
        </Button>
      }
    />
  );
}
