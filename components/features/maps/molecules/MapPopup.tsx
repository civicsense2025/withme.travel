'use client';

import React from 'react';
import { Popup } from 'react-map-gl/mapbox';

interface MapPopupProps {
  longitude: number;
  latitude: number;
  title?: string;
  subtitle?: string | number;
  subtitlePrefix?: string;
  onClose?: () => void;
  closeOnClick?: boolean;
  anchor?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

/**
 * A reusable map popup component for Mapbox maps
 */
const MapPopup: React.FC<MapPopupProps> = ({
  longitude,
  latitude,
  title = 'Selected Location',
  subtitle,
  subtitlePrefix = 'Day',
  onClose,
  closeOnClick = false,
  anchor = 'top',
}) => {
  return (
    <Popup
      anchor={anchor}
      longitude={longitude}
      latitude={latitude}
      onClose={onClose}
      closeOnClick={closeOnClick}
    >
      <div>
        {subtitle !== undefined && (
          <p className="text-xs text-muted-foreground">
            {subtitlePrefix} {subtitle}
          </p>
        )}
        <p className="font-medium text-sm">{title}</p>
      </div>
    </Popup>
  );
};

export default MapPopup; 