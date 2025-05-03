'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { CATEGORY_DISPLAY } from '@/utils/constants/ui';

interface TripDetailsSectionProps {
  tripId: string;
  items: DisplayItineraryItem[];
  canEdit: boolean;
  onAddAccommodation: () => void;
  onAddTransportation: () => void;
  onEditItem: (item: DisplayItineraryItem) => void;
  budget?: string;
  description?: string;
  tripPrivacy?: string;
}

export const TripDetailsSection: React.FC<TripDetailsSectionProps> = ({
  tripId,
  items,
  canEdit,
  onAddAccommodation,
  onAddTransportation,
  onEditItem,
  budget,
  description,
  tripPrivacy,
}) => {
  // Filter items by category
  const accommodations = items.filter(
    (item) => item.category === ITINERARY_CATEGORIES.ACCOMMODATION
  );

  const transportation = items.filter(
    (item) => item.category === ITINERARY_CATEGORIES.TRANSPORTATION
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Trip Details</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget information if available */}
        {budget && (
          <div className="mb-4">
            <h3 className="font-medium mb-1">Budget</h3>
            <p className="text-lg font-semibold">{budget}</p>
          </div>
        )}

        {/* Accommodations Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.ACCOMMODATION].emoji}
              </span>
              <h3 className="font-medium">Accommodations</h3>
            </div>
            {canEdit && (
              <Button onClick={onAddAccommodation} variant="outline" size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                <span>Add</span>
              </Button>
            )}
          </div>

          {accommodations.length === 0 ? (
            <div className="py-4 px-3 rounded-lg bg-muted/30 text-muted-foreground text-sm italic">
              No accommodations added yet. Add where you're staying!
            </div>
          ) : (
            <div className="space-y-3">
              {accommodations.map((item) => (
                <ItineraryItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => onEditItem(item)}
                  isCoreItem
                />
              ))}
            </div>
          )}
        </div>

        {/* Transportation Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.TRANSPORTATION].emoji}
              </span>
              <h3 className="font-medium">Transportation</h3>
            </div>
            {canEdit && (
              <Button onClick={onAddTransportation} variant="outline" size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                <span>Add</span>
              </Button>
            )}
          </div>

          {transportation.length === 0 ? (
            <div className="py-4 px-3 rounded-lg bg-muted/30 text-muted-foreground text-sm italic">
              No transportation added yet. Add how you're getting around!
            </div>
          ) : (
            <div className="space-y-3">
              {transportation.map((item) => (
                <ItineraryItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => onEditItem(item)}
                  isCoreItem
                />
              ))}
            </div>
          )}
        </div>

        {/* Trip Privacy */}
        {tripPrivacy && (
          <div className="pt-3 border-t border-border/40">
            <h3 className="font-medium mb-1">Trip Privacy</h3>
            <p className="text-muted-foreground text-sm">{tripPrivacy}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
