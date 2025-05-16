/**
 * ItineraryItemCard Component
 * 
 * Displays an itinerary item with type, title, schedule, and location.
 */

'use client';

import React, { useState } from 'react';
import { MapPin, MoreVertical, Pencil, Trash, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Type of an itinerary item
 */
export type ItineraryItemType = 
  | 'accommodation' 
  | 'transportation' 
  | 'activity' 
  | 'food'
  | 'restaurant'
  | 'attraction'
  | 'other';

/**
 * Category for an itinerary item
 */
export type ItineraryItemCategory = 
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'cafe'
  | 'hotel'
  | 'hostel'
  | 'airbnb'
  | 'flight'
  | 'train'
  | 'bus'
  | 'car_rental'
  | 'ferry'
  | 'museum'
  | 'tour'
  | 'event'
  | 'shopping'
  | 'beach'
  | 'hiking'
  | 'nightlife'
  | 'sightseeing'
  | 'other';

/**
 * Status for an itinerary item
 */
export type ItemStatus = 'suggested' | 'confirmed' | 'rejected';

/**
 * Base itinerary item properties
 */
export interface ItineraryItem {
  /** Unique identifier */
  id: string;
  /** Item title */
  title: string;
  /** Item type */
  type?: ItineraryItemType;
  /** More specific category */
  category?: ItineraryItemCategory;
  /** Day number (1-based) */
  day_number?: number | null;
  /** Start time (HH:MM) */
  start_time?: string | null;
  /** End time (HH:MM) */
  end_time?: string | null;
  /** Location address */
  address?: string | null;
  /** Item description */
  description?: string | null;
  /** Additional notes */
  notes?: string | null;
  /** External URL */
  url?: string | null;
  /** Position within day */
  position?: number;
  /** Item status */
  status?: ItemStatus;
  /** Formatted category (display friendly) */
  formattedCategory?: string;
}

/**
 * Props for ItineraryItemCard
 */
export interface ItineraryItemCardProps {
  /** Itinerary item data */
  item: ItineraryItem;
  /** Additional CSS class names */
  className?: string;
  /** Day number for display */
  dayNumber?: number;
  /** Edit handler */
  onEdit?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** Whether the card is for a core item (accommodation/transportation) */
  isCoreItem?: boolean;
  /** Whether the card is editable */
  editable?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default category display info
 */
const DEFAULT_CATEGORY_DISPLAY = {
  emoji: '📌',
  color: 'bg-gray-100 dark:bg-gray-800',
  label: 'Item'
};

/**
 * Display info by item type
 */
const ITEM_TYPE_DISPLAY = {
  accommodation: {
    emoji: '🏨',
    color: 'bg-blue-100 dark:bg-blue-950',
    label: 'Stay'
  },
  transportation: {
    emoji: '🚆',
    color: 'bg-orange-100 dark:bg-orange-950',
    label: 'Transport'
  },
  activity: {
    emoji: '🎭',
    color: 'bg-purple-100 dark:bg-purple-950',
    label: 'Activity'
  },
  food: {
    emoji: '🍽️',
    color: 'bg-green-100 dark:bg-green-950',
    label: 'Food'
  },
};

/**
 * Display info by category
 */
const CATEGORY_DISPLAY = {
  breakfast: {
    emoji: '☕',
    color: 'bg-yellow-100 dark:bg-yellow-950',
    label: 'Breakfast'
  },
  lunch: {
    emoji: '🥪',
    color: 'bg-green-100 dark:bg-green-950',
    label: 'Lunch'
  },
  dinner: {
    emoji: '🍲',
    color: 'bg-red-100 dark:bg-red-950',
    label: 'Dinner'
  },
  cafe: {
    emoji: '☕',
    color: 'bg-amber-100 dark:bg-amber-950',
    label: 'Cafe'
  },
  hotel: {
    emoji: '🏨',
    color: 'bg-blue-100 dark:bg-blue-950',
    label: 'Hotel'
  },
  // Add more categories as needed
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ItineraryItemCard displays an itinerary item in a card format
 */
export function ItineraryItemCard({
  item,
  className,
  dayNumber,
  onEdit,
  onDelete,
  isCoreItem = false,
  editable = true,
}: ItineraryItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Format scheduling information
  const scheduleTime = (() => {
    if (item.start_time && item.end_time) {
      return `${item.start_time} - ${item.end_time}`;
    } else if (item.start_time) {
      return `${item.start_time}`;
    }
    return null;
  })();

  // Format address
  const address = item.address || null;

  // Handle edit click
  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    }
  };

  // Handle delete click
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    }
  };

  // Card background color
  const bgColorClass = cn(
    'bg-card hover:bg-card/90 dark:bg-card/90 dark:hover:bg-card/80',
    isCoreItem && 'bg-card/95 border-l-4 border-l-primary/30'
  );

  // Get the appropriate category or type display
  let displayInfo = DEFAULT_CATEGORY_DISPLAY;

  if (item.category) {
    // Check if the category exists in our mapping
    const categoryKey = item.category;
    
    if (categoryKey in CATEGORY_DISPLAY) {
      displayInfo = CATEGORY_DISPLAY[categoryKey as keyof typeof CATEGORY_DISPLAY];
    }
  } else if (item.type) {
    // Only look up the type if it's one of our known types
    const type = item.type;
    if (type in ITEM_TYPE_DISPLAY) {
      displayInfo = ITEM_TYPE_DISPLAY[type as keyof typeof ITEM_TYPE_DISPLAY];
    }
  }

  // Format category for display
  const displayCategory = item.formattedCategory || item.category;
  const displayCategoryFormatted = displayCategory
    ? typeof displayCategory === 'string' && displayCategory.includes('_')
      ? displayCategory
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      : displayCategory
    : 'Unspecified';

  // Additional details for tooltip
  const details = [
    { label: 'Type', value: item.type || 'Unspecified' },
    { label: 'Category', value: displayCategoryFormatted },
    { label: 'Status', value: item.status || 'Unspecified' },
    { label: 'Notes', value: item.notes },
  ].filter((detail) => detail.value);

  return (
    <Card 
      className={cn('overflow-hidden', bgColorClass, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* CARD HEADER */}
      <div className="p-3 flex items-center justify-between border-b border-border/20">
        <div className="flex items-center gap-2">
          {/* Item type/category emoji icon */}
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center',
              displayInfo.color
            )}
          >
            <span className="text-base" aria-hidden="true">
              {displayInfo.emoji}
            </span>
          </div>

          {/* Title with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3
                  className="font-semibold text-base truncate cursor-help max-w-[180px]"
                  title={item.title ?? 'Untitled'}
                >
                  {item.title || 'Untitled Item'}
                </h3>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border border-border shadow-md w-64">
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
          </TooltipProvider>

          {/* Schedule time next to title if available */}
          {scheduleTime && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {scheduleTime}
            </span>
          )}
        </div>

        {/* Context Menu (right side of header) */}
        {editable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 rounded-full p-0',
                  isHovered ? 'opacity-100' : 'opacity-0'
                )}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              {item.url && (
                <DropdownMenuItem asChild>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Link
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="p-3">
        {/* Description/notes */}
        {item.description && <p className="text-sm text-primary/90 mb-2">{item.description}</p>}
        {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
      </div>

      {/* CARD FOOTER */}
      <div className="p-3 pt-0 flex items-center justify-between border-t border-border/20 mt-2">
        {/* Address (left) */}
        {address && (
          <div className="text-xs text-muted-foreground flex items-center gap-1" title={address}>
            <MapPin className="w-3 h-3 flex-shrink-0 opacity-70" />
            <span className="truncate max-w-[180px]">{address}</span>
          </div>
        )}
        {!address && <div className="w-1 h-1"></div>}

        {/* Day number badge (if provided) */}
        {dayNumber && (
          <span className="text-xs bg-primary/10 text-primary-foreground px-2 py-0.5 rounded-full">
            Day {dayNumber}
          </span>
        )}
      </div>
    </Card>
  );
} 