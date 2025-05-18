// ============================================================================
// TRIP CARD HEADER COMPONENT
// ============================================================================

import Image from 'next/image';
import React from 'react';

/**
 * Props for the TripCardHeader component
 */
export interface TripCardHeaderProps {
  /** Trip name */
  name: string;
  /** Destination name */
  destination: string;
  /** Cover image URL */
  coverImageUrl?: string | null;
  /** Trip status (optional) */
  status?: string;
}

/**
 * Displays a compact trip card header with image, name, and destination
 */
export function TripCardHeader({ name, destination, coverImageUrl, status }: TripCardHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={coverImageUrl || '/images/default-trip-image.jpg'}
          alt={name}
          width={48}
          height={48}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate text-base leading-tight">{name}</div>
        <div className="text-xs text-muted-foreground truncate">{destination}</div>
        {status && (
          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

export default TripCardHeader;
