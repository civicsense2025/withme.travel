import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DisplayItineraryItem } from '@/types/itinerary';
import {
  CATEGORY_DISPLAY,
  DEFAULT_CATEGORY_DISPLAY,
  ITEM_TYPE_DISPLAY,
  DEFAULT_TYPE_DISPLAY,
} from '@/utils/constants/ui';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';

export interface ItineraryItemCardProps {
  item: DisplayItineraryItem;
  className?: string;
  dayNumber?: number;
  onEdit?: () => void;
  isOverlay?: boolean; // Added for drag overlay
  isCoreItem?: boolean; // For core items (accommodation/transportation)
  [key: string]: any;
}

export const ItineraryItemCard: React.FC<ItineraryItemCardProps> = ({
  item,
  className,
  dayNumber,
  onEdit,
  isOverlay = false,
  isCoreItem = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => { 
    e.stopPropagation();
    setIsLiked(!isLiked); 
  };

  const handleEditClick = (e: React.MouseEvent) => { 
    e.stopPropagation();
    if (onEdit) onEdit(); 
  };

  const address = item.address || item.location;

  // Format time for display and tooltip - converts 24h to 12h time
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '';
    try {
      // Try to parse time (assuming format like "14:30")
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return format(date, 'h:mm a'); // Returns "2:30 PM"
    } catch (e) {
      return timeString; // Return original if parsing fails
    }
  };

  const scheduleTime = item.start_time
    ? item.end_time
      ? `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`
      : formatTime(item.start_time)
    : null;

  const bgColorClass = cn(
    'bg-card hover:bg-card/90 dark:bg-card/90 dark:hover:bg-card/80',
    isCoreItem && 'bg-card/95 border-primary/30'
  );

  // Get the appropriate category or type display
  let displayInfo = DEFAULT_CATEGORY_DISPLAY;

  if (item.category) {
    // Check if the category exists in our mapping
    // Using type assertion with 'as' since we know the structure
    const categoryKey = Object.values(ITINERARY_CATEGORIES).find((cat) => cat === item.category);

    if (categoryKey && categoryKey in CATEGORY_DISPLAY) {
      displayInfo = CATEGORY_DISPLAY[categoryKey as keyof typeof CATEGORY_DISPLAY];
    }
  } else if (item.type) {
    // Only look up the type if it's one of our known types
    const type = item.type.toLowerCase();
    if (
      type === 'accommodation' ||
      type === 'transportation' ||
      type === 'activity' ||
      type === 'food'
    ) {
      displayInfo = ITEM_TYPE_DISPLAY[type as keyof typeof ITEM_TYPE_DISPLAY];
    }
  }

  // Additional details for tooltip
  const details = [
    { label: 'Type', value: item.type || 'Unspecified' },
    { label: 'Category', value: item.category || 'Unspecified' },
    { label: 'Status', value: item.status || 'Unspecified' },
    { label: 'Notes', value: item.notes },
  ].filter((detail) => detail.value);

  return (
    <TooltipProvider>
      <div
        className={cn(
          'rounded-xl relative group transition-shadow duration-200 ease-in-out overflow-hidden',
          'border border-border/20 dark:border-border/10 hover:shadow-md dark:hover:border-border/30',
          bgColorClass,
          className
        )}
      >
        {/* Visual day indicator */}
        {dayNumber && (
          <div className="absolute -left-3 -top-3 rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center shadow-md transform -rotate-12 opacity-70">
            <span className="text-xs font-semibold">{dayNumber}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 relative z-10">
          <div className="flex items-start gap-3">
            {/* Item type/category emoji icon */}
            <div
              className={cn(
                'w-11 h-11 rounded-lg flex-shrink-0 flex items-center justify-center',
                displayInfo.color
              )}
            >
              <span className="text-lg" aria-hidden="true">
                {displayInfo.emoji}
              </span>
            </div>

            {/* Main content */}
            <div className="flex-grow min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className="font-semibold text-sm truncate cursor-help"
                    title={item.title ?? 'Untitled'}
                  >
                    {item.title || 'Untitled Item'}
                  </h3>
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  <div className="space-y-2 p-1">
                    <p className="font-semibold">{item.title || 'Untitled Item'}</p>
                    {details.map(
                      (detail, i) =>
                        detail.value && (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{detail.label}:</span> {detail.value}
                          </div>
                        )
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>

              {scheduleTime && <p className="text-xs text-muted-foreground">{scheduleTime}</p>}

              {address && (
                <p
                  className="text-xs text-muted-foreground flex items-center gap-1 mt-1"
                  title={address}
                >
                  <MapPin className="w-3 h-3 flex-shrink-0 opacity-70" />
                  <span className="truncate">{address}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              {/* Only show edit button if not in drag overlay */}
              {!isOverlay && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditClick}
                  className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">Edit item</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLikeClick}
                className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 flex-shrink-0"
              >
                <Heart
                  className={cn(
                    'w-4 h-4 transition-all',
                    isLiked ? 'fill-destructive text-destructive' : 'fill-none'
                  )}
                />
                <span className="sr-only">{isLiked ? 'Unlike' : 'Like'} item</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Color accent based on category/type */}
        <div className={cn('absolute top-0 bottom-0 left-0 w-[3px]', displayInfo.color)}></div>
      </div>
    </TooltipProvider>
  );
};