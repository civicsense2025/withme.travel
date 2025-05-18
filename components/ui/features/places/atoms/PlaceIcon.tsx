/**
 * PlaceIcon Component
 * 
 * Displays an icon based on the place category.
 */

'use client';

import React from 'react';
import { 
  Utensils, 
  Hotel, 
  Coffee, 
  Plane, 
  Bus, 
  Train, 
  Car, 
  Map, 
  Palmtree, 
  Building, 
  ShoppingBag,
  Ticket, 
  Landmark, 
  Home,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * PlaceIcon component props
 */
export interface PlaceIconProps {
  /** Category of the place */
  category?: string;
  /** Optional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
  /** Icon color */
  color?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Map of place categories to their corresponding icons
 */
const CATEGORY_ICON_MAP: Record<string, React.FC<any>> = {
  restaurant: Utensils,
  hotel: Hotel,
  cafe: Coffee,
  airport: Plane,
  'bus-station': Bus,
  'train-station': Train,
  'car-rental': Car,
  attraction: Landmark,
  beach: Palmtree,
  park: Palmtree,
  museum: Building,
  shopping: ShoppingBag,
  entertainment: Ticket,
  housing: Home,
  default: MapPin
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays an icon based on the place category
 */
export function PlaceIcon({ 
  category = 'default', 
  className, 
  size = 20, 
  color = 'currentColor' 
}: PlaceIconProps) {
  const normalizedCategory = category.toLowerCase();
  const Icon = CATEGORY_ICON_MAP[normalizedCategory] || CATEGORY_ICON_MAP.default;

  return (
    <Icon 
      className={cn('place-icon', className)} 
      size={size} 
      color={color}
      aria-hidden="true"
    />
  );
}

export default PlaceIcon; 