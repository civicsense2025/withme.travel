/**
 * PlaceIcon
 * 
 * Displays an icon based on the place category
 */

'use client';

import React from 'react';
import { 
  Utensils, 
  Bed, 
  Coffee, 
  Landmark, 
  ShoppingBag, 
  Train, 
  MapPin,
  Beer,
  Building,
  Palmtree,
  Plane,
  Music,
  Moon,
  Trophy,
  CircleHelp
} from 'lucide-react';
import { PlaceCategory } from '@/types/places';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceIconProps {
  /** The category of the place */
  category: PlaceCategory | string | null;
  /** Optional CSS class name */
  className?: string;
  /** Icon size in pixels (default: 24) */
  size?: number;
  /** Icon color */
  color?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays an icon representing the place category
 */
export function PlaceIcon({ 
  category, 
  className = '',
  size = 24, 
  color = 'currentColor'
}: PlaceIconProps) {
  // Map category to icon
  const getIconByCategory = () => {
    if (!category) return <MapPin size={size} color={color} className={className} />;
    
    switch(category) {
      case PlaceCategory.RESTAURANT:
        return <Utensils size={size} color={color} className={className} />;
      case PlaceCategory.HOTEL:
        return <Bed size={size} color={color} className={className} />;
      case PlaceCategory.CAFE:
        return <Coffee size={size} color={color} className={className} />;
      case PlaceCategory.LANDMARK:
        return <Landmark size={size} color={color} className={className} />;
      case PlaceCategory.SHOPPING:
        return <ShoppingBag size={size} color={color} className={className} />;
      case PlaceCategory.TRANSPORTATION:
        return <Train size={size} color={color} className={className} />;
      case PlaceCategory.BAR:
        return <Beer size={size} color={color} className={className} />;
      case PlaceCategory.MUSEUM:
        return <Building size={size} color={color} className={className} />;
      case PlaceCategory.PARK:
      case PlaceCategory.BEACH:
        return <Palmtree size={size} color={color} className={className} />;
      case PlaceCategory.AIRPORT:
        return <Plane size={size} color={color} className={className} />;
      case PlaceCategory.ENTERTAINMENT:
        return <Music size={size} color={color} className={className} />;
      case PlaceCategory.NIGHTLIFE:
        return <Moon size={size} color={color} className={className} />;
      case PlaceCategory.SPORTS:
        return <Trophy size={size} color={color} className={className} />;
      case PlaceCategory.ATTRACTION:
      case PlaceCategory.OTHER:
      default:
        return <MapPin size={size} color={color} className={className} />;
    }
  };

  return getIconByCategory();
}

export default PlaceIcon; 