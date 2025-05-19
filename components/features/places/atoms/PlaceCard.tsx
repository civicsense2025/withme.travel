/**
 * PlaceCard Atom
 *
 * Displays a card for a place (e.g., POI, restaurant).
 * @module components/features/places/atoms/PlaceCard
 */

import React from 'react';

/**
 * PlaceCard component props
 */
export interface PlaceCardProps {
  /** Place name */
  name: string;
  /** Optional image URL */
  imageUrl?: string;
  /** Optional description */
  description?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * PlaceCard atom for places (placeholder)
 */
export function PlaceCard({ name, imageUrl, description, onClick, className }: PlaceCardProps) {
  // TODO: Implement place card UI
  return (
    <div className={className} onClick={onClick} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, cursor: onClick ? 'pointer' : 'default', maxWidth: 240 }}>
      {imageUrl && <img src={imageUrl} alt={name} style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />}
      <h4>{name}</h4>
      {description && <p style={{ fontSize: 14, color: '#666' }}>{description}</p>}
    </div>
  );
}

export default PlaceCard; 