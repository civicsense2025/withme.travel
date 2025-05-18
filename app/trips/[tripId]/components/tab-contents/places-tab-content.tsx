/**
 * Places Tab Content
 * 
 * Displays a list of places associated with a trip, with search, filtering, and management options.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceList } from '@/components/ui/features/places/organisms/PlaceList';
import PlaceCard from '@/components/ui/features/places/molecules/PlaceCard';
import { usePlaces } from '@/hooks/use-places-v2';
import { PlusCircle, MapPin, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Place } from '@/types/places';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PlacesTabContentProps {
  tripId: string;
  canEdit: boolean;
  destinationId?: string;
  onPlaceAdded?: () => void;
}

export function PlacesTabContent({
  tripId,
  canEdit,
  destinationId,
  onPlaceAdded,
}: PlacesTabContentProps) {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { toast } = useToast();
  
  // Initialize usePlaces hook
  const {
    places,
    loading,
    error,
    fetchPlaces,
    lookupOrCreatePlace,
  } = usePlaces();

  // Fetch places when component mounts or destination changes
  useEffect(() => {
    if (destinationId) {
      fetchPlaces('', { category: selectedTab !== 'all' ? selectedTab : undefined });
    }
  }, [destinationId, selectedTab, fetchPlaces]);

  // Handle clicking on a place card
  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  // Handle adding a place to the trip
  const handleAddToTrip = async (place: Place) => {
    try {
      // Call API to add place to trip
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: place.name,
          description: place.description,
          location: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          item_type: 'place',
          category: place.category,
          place_id: place.id,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Place added to itinerary',
          description: `${place.name} has been added to your trip itinerary.`,
        });
        if (onPlaceAdded) onPlaceAdded();
      } else {
        throw new Error('Failed to add place to itinerary');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add place to itinerary. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle searching for a place
  const handleSearch = (query: string) => {
    fetchPlaces(query, { category: selectedTab !== 'all' ? selectedTab : undefined });
  };

  // Handle creating a new place
  const handleCreatePlace = async (data: Partial<Place>) => {
    if (!destinationId) {
      toast({
        title: 'Error',
        description: 'Destination ID is required to create a place',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await lookupOrCreatePlace({
        name: data.name || '',
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category || 'attraction',
      });

      if (result.success) {
        toast({
          title: 'Place created',
          description: `${result.data.name} has been created successfully.`,
        });
        setSelectedPlace(result.data);
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create place',
        variant: 'destructive',
      });
    }
  };

  // Render place details section
  const renderPlaceDetails = () => {
    if (!selectedPlace) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {selectedPlace.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedPlace.description && (
              <p className="text-sm text-muted-foreground">{selectedPlace.description}</p>
            )}
            {selectedPlace.address && (
              <div>
                <h4 className="text-sm font-medium">Address</h4>
                <p className="text-sm text-muted-foreground">{selectedPlace.address}</p>
              </div>
            )}
            {canEdit && (
              <Button onClick={() => handleAddToTrip(selectedPlace)}>
                Add to Itinerary
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // If no destination is set for the trip
  if (!destinationId) {
    return (
      <Alert className="mb-4">
        <AlertTitle>No destination selected</AlertTitle>
        <AlertDescription>
          Please select a destination for your trip to see places in that area.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Places</h2>
        {canEdit && (
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Place
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Places</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
          <TabsTrigger value="attraction">Attractions</TabsTrigger>
          <TabsTrigger value="hotel">Hotels</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <PlaceList
            enableSearch={true}
            enableCategoryFilter={true}
            onPlaceSelect={handlePlaceClick}
            searchPlaceholder="Search places in this destination..."
            gridLayout={true}
          />
        </TabsContent>

        <TabsContent value="restaurant" className="space-y-4">
          <PlaceList
            enableSearch={true}
            enableCategoryFilter={false}
            onPlaceSelect={handlePlaceClick}
            searchPlaceholder="Search restaurants..."
            gridLayout={true}
            initialQuery=""
          />
        </TabsContent>

        <TabsContent value="attraction" className="space-y-4">
          <PlaceList
            enableSearch={true}
            enableCategoryFilter={false}
            onPlaceSelect={handlePlaceClick}
            searchPlaceholder="Search attractions..."
            gridLayout={true}
            initialQuery=""
          />
        </TabsContent>

        <TabsContent value="hotel" className="space-y-4">
          <PlaceList
            enableSearch={true}
            enableCategoryFilter={false}
            onPlaceSelect={handlePlaceClick}
            searchPlaceholder="Search hotels..."
            gridLayout={true}
            initialQuery=""
          />
        </TabsContent>
      </Tabs>

      {selectedPlace && renderPlaceDetails()}
    </div>
  );
}

export default PlacesTabContent; 