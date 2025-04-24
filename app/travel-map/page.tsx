"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
// Import map components - assuming @vis.gl/react-google-maps is set up
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'; 

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  // Add other relevant fields if needed
}

export default function TravelMapPage() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDestinationId, setHoveredDestinationId] = useState<string | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        // Optionally redirect to login or show a message
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        // Fetch visited destinations
        const { data: visitedData, error: visitedError } = await supabase
          .from('user_travel')
          .select('destination_id')
          .eq('user_id', user.id);

        if (visitedError) throw new Error(`Failed to fetch travel data: ${visitedError.message}`);
        const visitedIds = visitedData?.map((entry: any) => entry.destination_id) || [];
        setVisited(visitedIds);

        // Fetch all destinations with coordinates
        // IMPORTANT: Ensure your 'destinations' table has 'latitude' and 'longitude' columns
        const { data: destinationsData, error: destinationsError } = await supabase
          .from('destinations')
          .select('id, name, city, country, latitude, longitude')
          .not('latitude', 'is', null) // Only fetch destinations with coordinates
          .not('longitude', 'is', null);

        if (destinationsError) throw new Error(`Failed to fetch destinations: ${destinationsError.message}`);
        
        setDestinations(destinationsData || []);

      } catch (err: any) {
        console.error("Error loading travel map data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
       fetchData();
    }
  }, [user, authLoading, supabase]);

  if (!googleMapsApiKey) {
    return (
      <div className="container py-12">
        <PageHeader heading="My Travel Map" description="Visualize your journeys across the globe." />
        <div className="mt-8 text-center text-red-600 bg-red-100 p-4 rounded-md">
          Configuration Error: Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <PageHeader heading="My Travel Map" description="Visualize your journeys across the globe." />

      <div className="mt-8 h-[600px] w-full rounded-lg overflow-hidden border relative">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : error ? (
           <div className="flex items-center justify-center h-full bg-muted">
             <p className="text-destructive">Error loading map: {error}</p>
           </div>
        ) : (
          <APIProvider apiKey={googleMapsApiKey}>
            <Map
              mapId="withme-travel-map" // Optional: for map styling customization
              defaultCenter={{ lat: 20, lng: 0 }} // Default center (can be adjusted)
              defaultZoom={2} // Default zoom level
              gestureHandling={'greedy'} // Allows map interaction without holding ctrl/cmd
              disableDefaultUI={true} // Optional: hide default controls if needed
            >
              {destinations.map((destination) => {
                const isHovered = hoveredDestinationId === destination.id;
                const isVisited = visited.includes(destination.id);

                return (
                  <AdvancedMarker
                    key={destination.id}
                    position={{ lat: destination.latitude!, lng: destination.longitude! }}
                  >
                    <div 
                      onMouseEnter={() => setHoveredDestinationId(destination.id)}
                      onMouseLeave={() => setHoveredDestinationId(null)}
                      className="relative cursor-pointer"
                      style={{ 
                        transition: 'transform 0.1s ease-in-out', 
                        transform: isHovered ? 'scale(1.3)' : 'scale(1)', 
                        zIndex: isHovered ? 10 : 1
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>
                        {isVisited ? '✅' : '📍'}
                      </span>
                      {isHovered && (
                        <div 
                          className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-background px-2 py-1 text-xs shadow-lg border"
                        >
                          {`${destination.city}, ${destination.country}`}
                        </div>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}
            </Map>
          </APIProvider>
        )}
      </div>
       <p className="text-sm text-muted-foreground mt-4 text-center">
         {visited.length} destinations visited out of {destinations.length} trackable locations.
       </p>
    </div>
  );
} 