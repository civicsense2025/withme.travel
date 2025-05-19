// Transit-specific component for bus and subway routes
import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Ensure CSS is imported if not globally

// Removed the duplicate global GeoJSON declaration - Assuming @types/geojson provides this

interface TransitStep {
  type: 'bus' | 'subway' | 'walk' | 'train';
  route: string;
  color: string;
  duration: number;
  geometry: GeoJSON.LineString; // Assumes GeoJSON types are globally available
  stops?: Array<{
    name: string;
    coordinates: [number, number];
  }>;
}

interface TransitRouteProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  mapboxToken: string;
  onRouteData?: (data: TransitStep[]) => void;
}

const TransitRoute: React.FC<TransitRouteProps> = ({
  start,
  end,
  mapboxToken,
  onRouteData,
}) => {
  const [transitSteps, setTransitSteps] = useState<TransitStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransitRoute = async () => {
      setLoading(true);
      setError(null);
      setTransitSteps([]); // Clear previous steps
      try {
        // Note: This is a placeholder API call - you would need to integrate with a proper transit API
        const response = await fetch(
          `/api/transit-route?startLat=${start.lat}&startLng=${start.lng}&endLat=${end.lat}&endLng=${end.lng}`
        );

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `Transit API Error (${response.status}): ${errorData || `Failed to fetch transit route`}`
          );
        }

        const data = await response.json();

        // Basic validation of response structure
        if (!data || !Array.isArray(data.steps)) {
          throw new Error('Invalid response format from transit API');
        }

        // Transform the data into our TransitStep format
        // Map potentially returns (TransitStep | null)[]
        const mappedSteps = data.steps.map((step: any): TransitStep | null => {
          // Add validation for each step if necessary
          if (!step.mode || !step.route_name || !step.duration || !step.geometry) {
            console.warn('Skipping invalid transit step:', step);
            return null; // Return null for invalid steps
          }
          return {
            type: step.mode,
            route: step.route_name,
            color: getTransitColor(step.mode),
            duration: step.duration,
            geometry: step.geometry, // Assuming API provides valid GeoJSON LineString
            stops: step.stops, // Assuming stops are optional or validated
          };
        });

        // Filter out null steps and assert type
        const steps: TransitStep[] = mappedSteps.filter(
          (step: TransitStep | null): step is TransitStep => step !== null
        );

        setTransitSteps(steps);
        onRouteData?.(steps);
      } catch (error: any) {
        console.error('Error fetching transit route:', error);
        setError(error.message || 'Failed to load transit directions.');
      }
      setLoading(false);
    };

    // Only fetch if start and end are valid
    if (start.lat && start.lng && end.lat && end.lng) {
      fetchTransitRoute();
    } else {
      setTransitSteps([]); // Clear steps if coordinates are invalid
    }
  }, [start.lat, start.lng, end.lat, end.lng, mapboxToken, onRouteData]); // Depend on specific lat/lng

  const getTransitColor = (mode: string) => {
    switch (mode) {
      case 'bus':
        return '#f59e0b'; // Amber 500
      case 'subway':
        return '#ef4444'; // Red 500
      case 'walk':
        return '#6b7280'; // Gray 500
      case 'train':
        return '#3b82f6'; // Blue 500
      default:
        return '#374151'; // Gray 700
    }
  };

  // Don't render layers if no steps or loading/error
  if (transitSteps.length === 0) {
    // Optionally show loading/error message here instead of in the info panel
    return null;
  }

  return (
    <>
      {transitSteps.map((step, index) => (
        <React.Fragment key={`transit-step-${index}`}>
          {/* Route line */}
          <Source
            id={`transit-route-${index}`}
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: step.geometry,
            }}
          >
            <Layer
              id={`transit-layer-${index}`}
              type="line"
              paint={{
                'line-color': step.color,
                'line-width': step.type === 'walk' ? 3 : 5,
                'line-opacity': 0.8,
                'line-dasharray': step.type === 'walk' ? [2, 2] : [1, 0],
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
            />
          </Source>

          {/* Transit stops - Render only if stops exist */}
          {step.stops &&
            step.stops.map((stop, stopIndex) => (
              <Source
                key={`stop-${index}-${stopIndex}`}
                id={`transit-stop-${index}-${stopIndex}`}
                type="geojson"
                data={{
                  type: 'Feature',
                  properties: { name: stop.name },
                  geometry: {
                    type: 'Point',
                    coordinates: stop.coordinates,
                  },
                }}
              >
                <Layer
                  id={`stop-layer-${index}-${stopIndex}`}
                  type="circle"
                  paint={{
                    'circle-radius': step.type === 'walk' ? 3 : 5, // Smaller radius for walk stops?
                    'circle-color': step.color,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#ffffff',
                  }}
                />
              </Source>
            ))}
        </React.Fragment>
      ))}
    </>
  );
};

export default TransitRoute;
