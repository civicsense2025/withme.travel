import React from 'react';
import { DisplayItineraryItem, ItinerarySection } from '@/types/itinerary';
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard';
import { formatDate, cn } from '@/lib/utils';

interface ItineraryDaySectionProps {
  section: ItinerarySection;
  onDrop?: (itemId: string, targetDayNumber: number | null) => void;
  onEdit?: (item: DisplayItineraryItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onVote?: (itemId: string, type: 'up' | 'down') => void;
  className?: string;
  isDragging?: boolean;
  canEdit?: boolean;
  editingItemId?: string | null;
  inlineEditValue?: string;
  onStartEdit?: (item: DisplayItineraryItem) => void;
  handleInlineEditChange?: (value: string) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  transform?: { x: number; y: number };
  transition?: string;
}

export function ItineraryDaySection({
  section,
  onDrop,
  onEdit,
  onDeleteItem,
  onVote,
  className,
  isDragging = false,
  canEdit = false,
  editingItemId,
  inlineEditValue,
  onStartEdit,
  handleInlineEditChange,
  onCancelEdit,
  onSaveEdit,
  transform,
  transition,
}: ItineraryDaySectionProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) {
      const itemId = e.dataTransfer.getData('itemId');
      onDrop(itemId, section.day_number);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      className={cn(
        'bg-background border rounded-lg p-4 space-y-4 mb-8',
        isDragging && 'border-primary border-dashed',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={style}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {section.title || `Day ${section.day_number}`}
          {section.date && (
            <span className="text-sm font-normal ml-2 text-muted-foreground">
              ({formatDate(section.date)})
            </span>
          )}
        </h3>
      </div>

      <div className="space-y-4">
        {section.items?.map((item) => (
          <div key={item.id} className="relative group">
            <div
              onClick={() => canEdit && onEdit?.(item as DisplayItineraryItem)}
              className={cn(canEdit && 'cursor-pointer')}
            >
              <ItineraryItemCard
                item={item as DisplayItineraryItem}
                dayNumber={section.day_number ?? undefined}
              />
            </div>
            {editingItemId === item.id && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <input
                  type="text"
                  value={inlineEditValue}
                  onChange={(e) => handleInlineEditChange?.(e.target.value)}
                  className="w-full p-2 border rounded"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveEdit?.();
                    if (e.key === 'Escape') onCancelEdit?.();
                  }}
                  autoFocus
                />
              </div>
            )}
          </div>
        ))}

        {(!section.items || section.items.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No items scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
}
