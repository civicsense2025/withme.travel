'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { MapProvider } from './map-provider';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with Google Maps
const GoogleMapsImport = dynamic(() => import('./google-maps-import'), {
  ssr: false,
  loading: () => <div>Loading importer...</div>
});

// New URL import component
const GoogleMapsUrlImport = dynamic(() => import('./google-maps-url-import'), {
  ssr: false,
  loading: () => <div>Loading URL importer...</div>
});

type Place = {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId: string;
  types: string[];
};

type ImportButtonProps = {
  tripId: string;
  canEdit: boolean;
};

export default function ImportMapButton({ tripId, canEdit }: ImportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  
  if (!canEdit) return null;
  
  const handleImportFromSearch = async (places: Place[]) => {
    try {
      // Convert places to itinerary items
      const itineraryItems = places.map(place => ({
        title: place.name,
        item_type: determineCategory(place.types), // Helper function to map Google place types to our categories
        notes: `Imported from Google Maps. Address: ${place.address}`,
        place_name: place.name,
        address: place.address,
        google_place_id: place.placeId,
        latitude: place.location.lat,
        longitude: place.location.lng,
        day_number: null // Add to unscheduled items
      }));
      
      // Call API with bulk import
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'google_maps_import',
          items: itineraryItems
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to import places');
      }
      
      // Close dialog after successful import
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Import error:', error);
    }
  };
  
  // Helper function to map Google place types to our itinerary categories
  const determineCategory = (types: string[]): string => {
    if (!types || types.length === 0) return 'Local Secrets';
    
    const typeMap: Record<string, string> = {
      'restaurant': 'Food & Drink',
      'cafe': 'Food & Drink',
      'bar': 'Nightlife',
      'night_club': 'Nightlife',
      'museum': 'Cultural Experiences',
      'art_gallery': 'Cultural Experiences',
      'tourist_attraction': 'Iconic Landmarks',
      'park': 'Outdoor Adventures',
      'shopping_mall': 'Shopping',
      'lodging': 'Accommodations',
      'airport': 'Transportation',
      'transit_station': 'Transportation'
    };
    
    // Find the first matching type in our map
    for (const type of types) {
      if (typeMap[type]) return typeMap[type];
    }
    
    // Default category
    return 'Local Secrets';
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Import from Google Maps
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Places from Google Maps</DialogTitle>
          <DialogDescription>
            Import places from Google Maps to your trip itinerary
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">Import from URL</TabsTrigger>
            <TabsTrigger value="search">Search Places</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="mt-4">
            <MapProvider>
              <GoogleMapsUrlImport 
                tripId={tripId}
                onClose={() => setIsDialogOpen(false)}
              />
            </MapProvider>
          </TabsContent>
          
          <TabsContent value="search" className="mt-4">
            <MapProvider>
              <GoogleMapsImport 
                onImport={handleImportFromSearch}
                onClose={() => setIsDialogOpen(false)}
              />
            </MapProvider>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 