/**
 * PlaceList Organism
 *
 * Displays a list of places.
 * @module components/features/places/organisms/PlaceList
 */

import React from 'react';

/**
 * PlaceList component props
 */
export interface PlaceListProps {
  /** List of places */
  places: {
    id: string;
    name: string;
    category?: string;
    address?: string;
    rating?: number;
    image_url?: string;
    description?: string;
  }[];
  /** Click handler for a place */
  onPlaceClick?: (id: string) => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * PlaceList organism for places (placeholder)
 */
export function PlaceList({ places, onPlaceClick, className }: PlaceListProps) {
  // TODO: Implement place list UI
  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {places.map((place) => (
        <div key={place.name} style={{ margin: 8 }}>
          {/* TODO: Replace with PlaceCard atom */}
          <div onClick={() => onPlaceClick?.(place.id)} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, cursor: 'pointer', maxWidth: 240 }}>
            {place.image_url && <img src={place.image_url} alt={place.name} style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />}
            <h4>{place.name}</h4>
            {place.description && <p style={{ fontSize: 14, color: '#666' }}>{place.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlaceList; 