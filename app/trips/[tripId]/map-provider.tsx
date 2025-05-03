'use client';

import { Libraries, useJsApiLoader } from '@react-google-maps/api';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const libraries = ['places'] as Libraries;

type MapContextType = {
  isLoaded: boolean;
  loadError: Error | undefined;
  hasApiKey: boolean;
};

const MapContext = createContext<MapContextType>({
  isLoaded: false,
  loadError: undefined,
  hasApiKey: false,
});

export const useMapContext = () => useContext(MapContext);

export function MapProvider({ children }: { children: ReactNode }) {
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    setHasApiKey(!!apiKey && apiKey.length > 0);
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // If API key is missing or invalid, show a specialized error message
  if (!hasApiKey) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md flex gap-3 items-center">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <div>
          <h3 className="font-medium">Missing Google Maps API Key</h3>
          <p className="text-sm text-muted-foreground">
            Please add a valid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapContext.Provider value={{ isLoaded, loadError, hasApiKey }}>
      {loadError ? (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="font-medium text-red-800">Error loading Google Maps</h3>
          <p className="text-sm text-red-600">{loadError.message}</p>
        </div>
      ) : (
        children
      )}
    </MapContext.Provider>
  );
}
