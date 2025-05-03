'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Map, {
  Source,
  Layer,
  Marker,
  NavigationControl,
  GeolocateControl,
} from 'react-map-gl';
import type { LngLatBoundsLike, LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TransitRoute } from './TransitRoute'; // Import the transit component
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui Button
import { Car, Footprints, Bike, Bus } from 'lucide-react'; // Icons for modes
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Define GeoJSON types if not globally available via @types/geojson
// (Assuming they are available globally for now)

type MapboxProfile = 'driving-traffic' | 'driving' | 'walking' | 'cycling';
type TransportMode = 'driving' | 'walking' | 'cycling' | 'transit';

interface RouteInfo {
  duration: number; // seconds
  distance: number; // meters
}

interface MultimodalMapViewProps {
  mapboxToken: string;
  startCoords: { lat: number; lng: number } | null;
  endCoords: { lat: number; lng: number } | null;
  initialMode?: TransportMode;
  mapStyle?: string;
}

export const MultimodalMapView: React.FC<MultimodalMapViewProps> = ({
  mapboxToken,
  startCoords,
  endCoords,
  initialMode = 'driving',
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
}) => {
  const mapRef = useRef<any>(null);
  const [mode, setMode] = useState<TransportMode>(initialMode);
  const [routeGeojson, setRouteGeojson] = useState<
    GeoJSON.FeatureCollection | GeoJSON.Feature | null
  >(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitRouteData, setTransitRouteData] = useState<any[]>([]); // To store data from TransitRoute

  const fetchMapboxRoute = useCallback(
    async (currentMode: TransportMode) => {
      if (!startCoords || !endCoords || currentMode === 'transit') {
        setRouteGeojson(null);
        setRouteInfo(null);
        return;
      }

      setLoading(true);
      setError(null);
      setRouteGeojson(null);
      setRouteInfo(null);

      let profile: MapboxProfile = 'driving';
      if (currentMode === 'walking') profile = 'walking';
      if (currentMode === 'cycling') profile = 'cycling';
      // driving-traffic could also be an option for 'driving' mode

      const startLngLat = `${startCoords.lng},${startCoords.lat}`;
      const endLngLat = `${endCoords.lng},${endCoords.lat}`;
      const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startLngLat};${endLngLat}?geometries=geojson&overview=full&access_token=${mapboxToken}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Mapbox Directions API Error (${response.status})`);
        }
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setRouteGeojson({
            // Create a Feature for the route line
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
          });
          setRouteInfo({
            duration: route.duration,
            distance: route.distance,
  });
        } else {
          throw new Error('No route found.');
        }
      } catch (err: any) {
        console.error('Error fetching Mapbox route:', err);
        setError(err.message || 'Failed to load route.');
        setRouteGeojson(null);
        setRouteInfo(null);
      } finally {
        setLoading(false);
      }
    },
    [startCoords, endCoords, mapboxToken]
  );

  useEffect(() => {
    // Fetch route when mode or coordinates change
    fetchMapboxRoute(mode);
    // If switching to transit, clear non-transit route data
    if (mode === 'transit') {
      setRouteGeojson(null);
      setRouteInfo(null);
    }
  }, [mode, startCoords, endCoords, fetchMapboxRoute]);

  useEffect(() => {
    // Fit map bounds when coordinates change or a route is loaded
    if (mapRef.current && startCoords && endCoords) {
      const bounds: LngLatBoundsLike = [
        [startCoords.lng, startCoords.lat],
        [endCoords.lng, endCoords.lat],
      ];
      mapRef.current.fitBounds(bounds, {
        padding: 80, // Add padding around the bounds
        duration: 1000, // Animation duration
      });
    }
    // Optionally fit bounds when routeGeojson changes for non-transit
  }, [startCoords, endCoords, routeGeojson]); // Re-fit when route changes too

  const handleModeChange = (newMode: TransportMode) => {
    setMode(newMode);
    setTransitRouteData([]); // Clear transit data when changing mode
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  // Default viewport if no coords
  const initialViewState = {
    longitude: -98.5795, // Center of US
    latitude: 39.8283,
    zoom: 3,
  };

  const getRouteColor = (currentMode: TransportMode): string => {
    switch (currentMode) {
      case 'driving':
        return '#3b82f6'; // Blue
      case 'walking':
        return '#16a34a'; // Green
      case 'cycling':
        return '#ea580c'; // Orange
      case 'transit':
        return '#6b7280'; // Gray (TransitRoute handles its own colors)
      default:
        return '#374151';
    }
  };

  return (
    <div className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden border">
      <Map
        ref={mapRef}
        mapboxApiAccessToken={mapboxToken}
        // @ts-ignore - initialViewState seems correct per types, but causes errors.
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        // Optional: Control viewport state
        // latitude={viewport.latitude}
        // longitude={viewport.longitude}
        // zoom={viewport.zoom}
        // onMove={evt => setViewport(evt.viewState)}
      >
        <NavigationControl />
        <GeolocateControl />

        {/* Markers */}
        {startCoords && <Marker longitude={startCoords.lng} latitude={startCoords.lat} />}
        {endCoords && <Marker longitude={endCoords.lng} latitude={endCoords.lat} />}

        {/* Route Layer for Driving, Walking, Cycling */}
        {mode !== 'transit' && routeGeojson && (
          <Source id="route" type="geojson" data={routeGeojson}>
            <Layer
              id="route-layer"
              type="line"
              paint={{
                'line-color': getRouteColor(mode),
                'line-width': 5,
                'line-opacity': 0.75,
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
            />
          </Source>
        )}

        {/* Transit Route Component */}
        {mode === 'transit' && startCoords && endCoords && (
          <TransitRoute
            start={startCoords}
            end={endCoords}
            mapboxToken={mapboxToken}
            onRouteData={setTransitRouteData} // Pass setter to get data back
          />
        )}
      </Map>

      {/* Mode Selector Controls */}
      <Card className="absolute top-2 left-2 z-10 shadow-md">
        <CardContent className="p-1 flex space-x-1">
          <Button
            variant={mode === 'driving' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => handleModeChange('driving')}
            aria-label="Driving Mode"
          >
            <Car className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === 'walking' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => handleModeChange('walking')}
            aria-label="Walking Mode"
          >
            <Footprints className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === 'cycling' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => handleModeChange('cycling')}
            aria-label="Cycling Mode"
          >
            <Bike className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === 'transit' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => handleModeChange('transit')}
            aria-label="Transit Mode"
          >
            <Bus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Route Info / Loading / Error Panel */}
      <Card className="absolute bottom-2 left-2 z-10 shadow-md max-w-[200px]">
        <CardContent className="p-2 text-xs">
          {loading && (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          )}
          {error && <p className="text-red-600 font-medium">Error: {error}</p>}
          {!loading && !error && mode !== 'transit' && routeInfo && (
            <div className="space-y-1">
              <p>
                <strong>Mode:</strong> {mode}
              </p>
              <p>
                <strong>Duration:</strong> {formatDuration(routeInfo.duration)}
              </p>
              <p>
                <strong>Distance:</strong> {formatDistance(routeInfo.distance)}
              </p>
            </div>
          )}
          {!loading && !error && mode === 'transit' && transitRouteData.length === 0 && (
            <p className="text-muted-foreground">No transit route found.</p>
          )}
          {/* Transit steps info could be displayed here if onRouteData is used effectively */}
          {!loading && !error && mode === 'transit' && transitRouteData.length > 0 && (
            <p>Transit route loaded ({transitRouteData.length} steps).</p>
          )}
          {!loading && !error && !routeInfo && mode !== 'transit' && (
            <p className="text-muted-foreground">Select start/end points.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};