/**
 * PlaceAddress
 * 
 * Displays a formatted address for places
 */

'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceAddressProps {
  /** The address to display */
  address: string | null;
  /** Whether to show the map pin icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** CSS classes for the icon */
  iconClassName?: string;
  /** CSS classes for the text */
  textClassName?: string;
  /** Size of the icon */
  iconSize?: number;
  /** Maximum length before truncating (0 for no truncation) */
  maxLength?: number;
  /** Whether to be interactive (showing tooltip on hover/truncation) */
  interactive?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a formatted address for places with optional icon
 */
export function PlaceAddress({
  address,
  showIcon = true,
  className = '',
  iconClassName = '',
  textClassName = '',
  iconSize = 16,
  maxLength = 0,
  interactive = true,
}: PlaceAddressProps) {
  if (!address) return null;
  
  // Truncate address if needed and maxLength is set
  const displayAddress = maxLength > 0 && address.length > maxLength
    ? `${address.substring(0, maxLength)}...`
    : address;

  // Format the address (simple implementation, could be expanded)
  const formattedAddress = displayAddress.trim();

  return (
    <div className={cn(
      'flex items-center gap-1', 
      className
    )}>
      {showIcon && (
        <MapPin 
          size={iconSize} 
          className={cn('text-gray-500 flex-shrink-0', iconClassName)}
        />
      )}
      <span 
        className={cn('text-gray-600', textClassName)}
        title={interactive && maxLength > 0 && address.length > maxLength ? address : undefined}
      >
        {formattedAddress}
      </span>
    </div>
  );
}

export default PlaceAddress; 