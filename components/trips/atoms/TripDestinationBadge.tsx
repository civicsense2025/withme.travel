'use client';

import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for the TripDestinationBadge component
 */
export interface TripDestinationBadgeProps {
  /** Destination name */
  destination: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color theme */
  color?: 'default' | 'primary' | 'secondary' | 'muted';
  /** Whether to show the map pin icon */
  showIcon?: boolean;
  /** Optional shortened version of destination for small screens */
  shortDestination?: string;
  /** Optional country code for flag (not implemented yet) */
  countryCode?: string;
}

/**
 * Component for displaying trip destination as a badge
 */
export function TripDestinationBadge({
  destination,
  className,
  size = 'md',
  color = 'default',
  showIcon = true,
  shortDestination,
  countryCode
}: TripDestinationBadgeProps) {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };

  // Color classes
  const colorClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    muted: 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
  };

  // Icon size
  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16
  }[size];

  // Determine if we should use the short destination
  const displayDestination = shortDestination && size === 'sm' 
    ? shortDestination 
    : destination;

  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full whitespace-nowrap font-medium',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    >
      {showIcon && (
        <MapPin 
          size={iconSize} 
          className={cn(
            'mr-1',
            size === 'sm' ? '-ml-0.5' : size === 'md' ? '-ml-1' : '-ml-1.5'
          )} 
        />
      )}
      {displayDestination}
    </span>
  );
} 