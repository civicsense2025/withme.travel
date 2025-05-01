'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { CATEGORY_DISPLAY } from '@/utils/constants/ui';

interface CoreTravelItemsSectionProps {
  items: DisplayItineraryItem[];
  canEdit: boolean;
  onAddItem: (category: string) => void;
  onEditItem: (item: DisplayItineraryItem) => void;
}

export const CoreTravelItemsSection: React.FC<CoreTravelItemsSectionProps> = ({
  items,
  canEdit,
  onAddItem,
  onEditItem,
}) => {
  // Filter items by category
  const accommodations = items.filter(
    (item) => item.category === ITINERARY_CATEGORIES.ACCOMMODATIONS
  );
  
  const transportation = items.filter(
    (item) => item.category === ITINERARY_CATEGORIES.TRANSPORTATION
  );

  // Ensure we only show the section if we have items or the user can edit
  const showAccommodations = accommodations.length > 0 || canEdit;
  const showTransportation = transportation.length > 0 || canEdit;
  
  // Don't show anything if no items and can't edit
  if (!showAccommodations && !showTransportation) {
    return null;
  }

  return (
    <div className="space-y-6 mb-8">
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            Trip Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accommodations section */}
          {showAccommodations && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">
                    {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.ACCOMMODATIONS].emoji}
                  </span>
                  <span>Accommodations</span>
                </h3>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onAddItem(ITINERARY_CATEGORIES.ACCOMMODATIONS)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Accommodation
                  </Button>
                )}
              </div>
              
              {accommodations.length > 0 ? (
                <div className="grid gap-3">
                  {accommodations.map((item) => (
                    <ItineraryItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => onEditItem(item)}
                      isCoreItem
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Add accommodations to help everyone know where you'll be staying
                </p>
              )}
            </div>
          )}

          {/* Transportation section */}
          {showTransportation && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">
                    {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.TRANSPORTATION].emoji}
                  </span>
                  <span>Transportation</span>
                </h3>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onAddItem(ITINERARY_CATEGORIES.TRANSPORTATION)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Transportation
                  </Button>
                )}
              </div>
              
              {transportation.length > 0 ? (
                <div className="grid gap-3">
                  {transportation.map((item) => (
                    <ItineraryItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => onEditItem(item)}
                      isCoreItem
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Add transportation details like flights, rentals, or transit tickets
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
