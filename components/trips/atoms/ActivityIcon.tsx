'use client';

import { cn } from '@/lib/utils';
import {
  Utensils,
  Bed,
  Plane,
  MapPin,
  Ticket,
  Calendar,
  Landmark,
  Coffee,
  Waves,
  Warehouse,
  Bike,
  Palmtree,
  Bus,
  Train,
  Car,
  ShoppingBag,
  Camera,
  Music,
  Sunset,
  Ship,
  GlassWater,
  Tent,
  Mountain,
  Building,
  LucideIcon
} from 'lucide-react';

/**
 * All supported activity types
 */
export type ActivityType =
  | 'food'
  | 'lodging'
  | 'flight'
  | 'location'
  | 'ticket'
  | 'event'
  | 'attraction'
  | 'cafe'
  | 'beach'
  | 'museum'
  | 'biking'
  | 'nature'
  | 'bus'
  | 'train'
  | 'car'
  | 'shopping'
  | 'photo'
  | 'music'
  | 'sunset'
  | 'boat'
  | 'drink'
  | 'camping'
  | 'hiking'
  | 'architecture'
  | 'other';

/**
 * Props for the ActivityIcon component
 */
export interface ActivityIconProps {
  /** Type of activity */
  type: ActivityType;
  /** Optional additional CSS classes */
  className?: string;
  /** Size of the icon */
  size?: number;
  /** Whether to show a background */
  withBackground?: boolean;
  /** Optional background color when using withBackground */
  bgColor?: 'default' | 'primary' | 'muted' | 'none' | 'auto';
  /** Optional stroke width */
  strokeWidth?: number;
  /** Whether to use solid background */
  solid?: boolean;
}

/**
 * Component for displaying an icon based on activity type
 */
export function ActivityIcon({
  type,
  className,
  size = 16,
  withBackground = false,
  bgColor = 'auto',
  strokeWidth = 2,
  solid = false
}: ActivityIconProps) {
  // Map activity types to icons
  const iconMap: Record<ActivityType, LucideIcon> = {
    food: Utensils,
    lodging: Bed,
    flight: Plane,
    location: MapPin,
    ticket: Ticket,
    event: Calendar,
    attraction: Landmark,
    cafe: Coffee,
    beach: Waves,
    museum: Warehouse,
    biking: Bike,
    nature: Palmtree,
    bus: Bus,
    train: Train,
    car: Car,
    shopping: ShoppingBag,
    photo: Camera,
    music: Music,
    sunset: Sunset,
    boat: Ship,
    drink: GlassWater,
    camping: Tent,
    hiking: Mountain,
    architecture: Building,
    other: MapPin
  };

  // Colors for different activity types
  const colorMap: Record<ActivityType, string> = {
    food: 'text-orange-500',
    lodging: 'text-indigo-500',
    flight: 'text-blue-500',
    location: 'text-red-500',
    ticket: 'text-purple-500',
    event: 'text-pink-500',
    attraction: 'text-yellow-500',
    cafe: 'text-brown-500',
    beach: 'text-cyan-500',
    museum: 'text-amber-500',
    biking: 'text-green-500',
    nature: 'text-emerald-500',
    bus: 'text-gray-500',
    train: 'text-slate-500',
    car: 'text-zinc-500',
    shopping: 'text-rose-500',
    photo: 'text-sky-500',
    music: 'text-violet-500',
    sunset: 'text-orange-600',
    boat: 'text-blue-600',
    drink: 'text-cyan-600',
    camping: 'text-green-600',
    hiking: 'text-emerald-600',
    architecture: 'text-amber-600',
    other: 'text-gray-500'
  };

  // Background colors for different activity types (light version)
  const bgColorMap: Record<ActivityType, string> = {
    food: 'bg-orange-100 dark:bg-orange-950',
    lodging: 'bg-indigo-100 dark:bg-indigo-950',
    flight: 'bg-blue-100 dark:bg-blue-950',
    location: 'bg-red-100 dark:bg-red-950',
    ticket: 'bg-purple-100 dark:bg-purple-950',
    event: 'bg-pink-100 dark:bg-pink-950',
    attraction: 'bg-yellow-100 dark:bg-yellow-950',
    cafe: 'bg-amber-100 dark:bg-amber-950',
    beach: 'bg-cyan-100 dark:bg-cyan-950',
    museum: 'bg-amber-100 dark:bg-amber-950',
    biking: 'bg-green-100 dark:bg-green-950',
    nature: 'bg-emerald-100 dark:bg-emerald-950',
    bus: 'bg-gray-100 dark:bg-gray-800',
    train: 'bg-slate-100 dark:bg-slate-800',
    car: 'bg-zinc-100 dark:bg-zinc-800',
    shopping: 'bg-rose-100 dark:bg-rose-950',
    photo: 'bg-sky-100 dark:bg-sky-950',
    music: 'bg-violet-100 dark:bg-violet-950',
    sunset: 'bg-orange-100 dark:bg-orange-950',
    boat: 'bg-blue-100 dark:bg-blue-950',
    drink: 'bg-cyan-100 dark:bg-cyan-950',
    camping: 'bg-green-100 dark:bg-green-950',
    hiking: 'bg-emerald-100 dark:bg-emerald-950',
    architecture: 'bg-amber-100 dark:bg-amber-950',
    other: 'bg-gray-100 dark:bg-gray-800'
  };

  // Background colors for different background options
  const bgOptionColors = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    muted: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
    none: '',
    auto: bgColorMap[type]
  };

  // Get the icon component for the activity type
  const Icon = iconMap[type] || iconMap.other;

  // Prepare classes
  const iconClasses = cn(
    !withBackground && !solid && colorMap[type],
    solid && 'text-white',
    className
  );

  // If we want a background
  if (withBackground) {
    const backgroundClasses = cn(
      'inline-flex items-center justify-center rounded-full p-2',
      solid ? colorMap[type].replace('text-', 'bg-') : bgOptionColors[bgColor],
      className
    );

    return (
      <div className={backgroundClasses}>
        <Icon size={size} strokeWidth={strokeWidth} />
      </div>
    );
  }

  // Otherwise just return the icon
  return <Icon className={iconClasses} size={size} strokeWidth={strokeWidth} />;
} 