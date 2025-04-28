import React from 'react';
import { DisplayItineraryItem, ItinerarySection } from '@/app/trips/[tripId]/page';
import { ItineraryItemCard } from './itinerary/ItineraryItemCard';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './ui/card';
import { TravelTimesResult } from '@/lib/mapbox';
import { format } from 'date-fns';

interface ItineraryDaySectionProps {
  section: ItinerarySection;
  canEdit: boolean;
  tripId: string;
  onAddItem: () => void;
  travelTimes: Record<string, TravelTimesResult> | null;
  loadingTravelTimes: boolean;
  onVote: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => void;
  onEditItem: (item: DisplayItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
  editingItemId: string | null;
  inlineEditValue: string;
  onStartEdit: (item: DisplayItineraryItem) => void;
  handleInlineEditChange: (value: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export const ItineraryDaySection: React.FC<ItineraryDaySectionProps> = ({
  section,
  canEdit,
  tripId,
  onAddItem,
  travelTimes,
  loadingTravelTimes,
  onVote,
  onEditItem,
  onDeleteItem,
  editingItemId,
  inlineEditValue,
  onStartEdit,
  handleInlineEditChange,
  onCancelEdit,
  onSaveEdit,
}) => {
  const formattedDate = section.date ? format(new Date(section.date), 'MMM d, yyyy') : '';

  return (
    <Card className="p-4">
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
        <CardTitle className="text-lg">
          Day {section.day_number} - {formattedDate}
        </CardTitle>
        {canEdit && (
          <Button onClick={onAddItem} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </CardHeader>
      <div className="space-y-2">
        {section.items.map((item) => (
          <ItineraryItemCard
            key={item.id}
            item={item}
            editingItemId={editingItemId}
            inlineEditValue={inlineEditValue}
            onStartEdit={onStartEdit}
            handleInlineEditChange={handleInlineEditChange}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onDeleteItem={onDeleteItem}
            onVote={onVote}
            onEditItem={onEditItem}
            canEdit={canEdit}
            onStatusChange={() => {}}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
    </Card>
  );
};