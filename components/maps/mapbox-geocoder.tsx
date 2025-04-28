"use client"

import React, { useRef, useEffect } from 'react';
import MapboxGeocoder, { GeocoderOptions } from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl'; // Ensure mapboxgl is imported
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox GL CSS

// Mapbox GL JS requires its CSS to be included
// If it's not already globally included, import it here or in your global layout

// Define a more specific type for the result object if possible
// You might need to console.log the result object to see its exact structure
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  // Add other properties you need from the result (center, properties, etc.)
  [key: string]: any; // Allow other properties
}

interface MapboxGeocoderProps {
  onResult: (result: GeocoderResult) => void; // Use our defined result type
  initialValue?: string;
  options?: Omit<GeocoderOptions, 'accessToken' | 'mapboxgl'>; // Allow passing other options
}

const MapboxGeocoderComponent: React.FC<MapboxGeocoderProps> = ({ onResult, initialValue, options }) => {
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  // Add ref for the geocoder instance
  const geocoderInstanceRef = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error('Mapbox Access Token is not set.');
      return;
    }

    if (geocoderContainerRef.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
        mapboxgl: mapboxgl as any, // Use type assertion as a temporary workaround for the mapboxgl instance type mismatch
        marker: false,
        ...options, // Spread additional options
      });

      geocoder.addTo(geocoderContainerRef.current);

      // Store the instance
      geocoderInstanceRef.current = geocoder;

      // Set initial value if provided
      if (initialValue) {
        geocoder.setInput(initialValue);
      }

      // Listen for results
      geocoder.on('result', (e: any) => { // Use 'any' for the event type for now
        // The actual result data is typically on e.result
        if (e.result) {
          onResult(e.result as GeocoderResult); // Assert type for the result object
        }
      });

      // Listen for clear event
      geocoder.on('clear', () => {
        // Handle clear event if needed, e.g., reset parent state
        // Call onResult with null when the input is cleared internally
        onResult(null as any); // Pass null to signal clearing
      });

      // Cleanup on unmount
      return () => {
        // Clear the ref
        geocoderInstanceRef.current = null;
        // Ensure the container is cleared thoroughly on cleanup
        if (geocoderContainerRef.current) {
          // Remove all child nodes
          while (geocoderContainerRef.current.firstChild) {
              geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
          }
        }
      };
    }
  }, [onResult, initialValue, options]); // Re-run if onResult or initialValue changes

  return <div ref={geocoderContainerRef} className="mapbox-geocoder" />;
};

export default MapboxGeocoderComponent; 