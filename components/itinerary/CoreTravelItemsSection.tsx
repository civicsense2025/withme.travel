'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { CATEGORY_DISPLAY } from '@/utils/constants/ui';
import { cn } from '@/lib/utils';

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
  const [expandedSections, setExpandedSections] = useState({
    accommodations: true,
    transportation: true,
  });

  // Filter items by category
  const accommodations = items.filter(
    (item) => item.category === ITINERARY_CATEGORIES.ACCOMMODATION
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

  const toggleSection = (section: 'accommodations' | 'transportation') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6 mb-8">
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accommodations section */}
          {showAccommodations && (
            <div className="space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('accommodations')}
              >
                <h3 className="text-sm font-medium flex items-center gap-2">
                  {expandedSections.accommodations ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="text-base" aria-hidden="true">
                    {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.ACCOMMODATION].emoji}
                  </span>
                  <span>Accommodations</span>
                </h3>
                {canEdit && expandedSections.accommodations && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 border-dashed border-muted-foreground/50 hover:border-muted-foreground"
                    onClick={(e) => {
                      return e.stopPropagation();
                      onAddItem(ITINERARY_CATEGORIES.ACCOMMODATION);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Accommodation
                  </Button>
                )}
              </div>

              {expandedSections.accommodations && (
                <>
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
                    <div
                      className={cn(
                        'border border-dashed rounded-md p-4 flex items-center justify-center cursor-pointer',
                        'text-sm text-muted-foreground hover:border-muted-foreground transition-colors'
                      )}
                      onClick={() => canEdit && onAddItem(ITINERARY_CATEGORIES.ACCOMMODATION)}
                    >
                      <div className="text-center space-y-1">
                        <Plus className="h-4 w-4 mx-auto" />
                        <p>Add accommodations to help everyone know where you'll be staying</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Transportation section */}
          {showTransportation && (
            <div className="space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('transportation')}
              >
                <h3 className="text-sm font-medium flex items-center gap-2">
                  {expandedSections.transportation ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="text-base" aria-hidden="true">
                    {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.TRANSPORTATION].emoji}
                  </span>
                  <span>Transportation</span>
                </h3>
                {canEdit && expandedSections.transportation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 border-dashed border-muted-foreground/50 hover:border-muted-foreground"
                    onClick={(e) => {
                      return e.stopPropagation();
                      onAddItem(ITINERARY_CATEGORIES.TRANSPORTATION);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Transportation
                  </Button>
                )}
              </div>

              {expandedSections.transportation && (
                <>
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
                    <div
                      className={cn(
                        'border border-dashed rounded-md p-4 flex items-center justify-center cursor-pointer',
                        'text-sm text-muted-foreground hover:border-muted-foreground transition-colors'
                      )}
                      onClick={() => canEdit && onAddItem(ITINERARY_CATEGORIES.TRANSPORTATION)}
                    >
                      <div className="text-center space-y-1">
                        <Plus className="h-4 w-4 mx-auto" />
                        <p>Add transportation details like flights, rentals, or transit tickets</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
