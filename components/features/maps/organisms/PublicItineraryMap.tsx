'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Map, {
  Marker,
  Popup,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
  MapMouseEvent,
  ViewStateChangeEvent,
  MarkerEvent,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

// Define the structure for a location point derived from itinerary items
interface LocationPoint {
  id: number;
  latitude: number;
  longitude: number;
  name?: string | null; // Optional name for popup/tooltip
  day?: number | null;
}

// Define the props for the map component
interface PublicItineraryMapProps {
  locations: LocationPoint[];
  mapboxToken: string;
}

export default function PublicItineraryMap({ locations, mapboxToken }: PublicItineraryMapProps) {
  const mapRef = useRef<any>(null); // Ref for map instance
  const [viewport, setViewport] = useState({
    latitude: 40.7128, // Default: New York City
    longitude: -74.006,
    zoom: 2, // Start zoomed out
    pitch: 0,
    bearing: 0,
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);

  // Calculate map bounds based on locations
  useEffect(() => {
    if (locations && locations.length > 0 && mapRef.current) {
      const map = mapRef.current.getMap();
      if (!map) return;

      // Use Mapbox LngLatBounds for fitting
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach((loc) => {
        return bounds.extend([loc.longitude, loc.latitude]);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
          duration: 1000, // Animate zoom
        });
      }
    }
  }, [locations]); // Re-run when locations change

  // Memoize markers to prevent unnecessary re-renders
  const markers = useMemo(
    () =>
      locations?.map((loc) => (
        <Marker
          key={`marker-${loc.id}`}
          longitude={loc.longitude}
          latitude={loc.latitude}
          anchor="bottom"
          onClick={(e: MarkerEvent<MouseEvent>) => {
            if (e.originalEvent) {
              e.originalEvent.stopPropagation();
            }
            setSelectedLocation(loc);
          }}
        >
          {/* Basic marker style - can be customized */}
          <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white cursor-pointer" />
        </Marker>
      )),
    [locations]
  );

  const handleMapClick = (event: MapMouseEvent) => {
    // If clicking on a marker, ignore map click to keep popup open
    if (
      event.originalEvent.target &&
      (event.originalEvent.target as HTMLElement).closest('.mapboxgl-marker')
    ) {
      // ... existing code ...
    }
  };

  if (!mapboxToken) {
    return <div className="text-center p-4 text-red-600">Mapbox token is not configured.</div>;
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-md overflow-hidden border">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={viewport}
        onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)} // Update viewport on map move
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12" // Or choose another style
        // Optional: improve performance by preventing map redraws when popups close
        // See react-map-gl docs for advanced usage
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" showCompass={false} />
        <ScaleControl />

        {markers}

        {selectedLocation && (
          <Popup
            anchor="top"
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            onClose={() => setSelectedLocation(null)}
            closeOnClick={false} // Keep popup open until explicitly closed
          >
            <div>
              {selectedLocation.day && (
                <p className="text-xs text-muted-foreground">Day {selectedLocation.day}</p>
              )}
              <p className="font-medium text-sm">{selectedLocation.name || 'Selected Location'}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
} 