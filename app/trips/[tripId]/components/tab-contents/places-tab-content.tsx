/**
 * Places Tab Content
 *
 * Displays a list of places associated with a trip, with search, filtering, and management options.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceList } from '@/components/features/places/organisms/PlaceList';
import { usePlaces } from '@/lib/features/places/hooks';
import { PlusCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Place } from '@/types/places';
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
    isLoading, 
    error, 
    refreshPlaces, 
    addPlace 
  } = usePlaces({ tripId });

  // Handle clicking on a place card
  const handlePlaceClick = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    if (place) {
      setSelectedPlace(place);
    }
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
          item_type: 'place',
          category: place.category,
          place_id: place.id,
        }),
      });

      if (response.ok) {
        toast({
          children: (
            <>
              <div className="font-bold">Place added to itinerary</div>
              <div>{place.name} has been added to your trip itinerary.</div>
            </>
          ),
        });
        if (onPlaceAdded) onPlaceAdded();
      } else {
        throw new Error('Failed to add place to itinerary');
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        children: (
          <>
            <div className="font-bold">Error</div>
            <div>Failed to add place to itinerary. Please try again.</div>
          </>
        ),
      });
    }
  };

  // Handle creating a new place
  const handleCreatePlace = async (name: string, category?: string, address?: string) => {
    if (!tripId) {
      toast({
        variant: 'destructive',
        children: (
          <>
            <div className="font-bold">Error</div>
            <div>Trip ID is required to add a place</div>
          </>
        ),
      });
      return;
    }

    try {
      const newPlace = await addPlace({
        name,
        category,
        address
      });

      if (newPlace) {
        toast({
          children: (
            <>
              <div className="font-bold">Place created</div>
              <div>{newPlace.name} has been added successfully.</div>
            </>
          ),
        });
        setSelectedPlace(newPlace);
      } else {
        throw new Error('Failed to create place');
      }
    } catch (err) {
      toast({
          variant: 'destructive',
        children: (
          <>
            <div className="font-bold">Error</div>
            <div>{err instanceof Error ? err.message : 'Failed to create place'}</div>
          </>
        ),
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
              <Button onClick={() => handleAddToTrip(selectedPlace)}>Add to Itinerary</Button>
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

  // Filter places based on the selected tab
  const filteredPlaces = selectedTab === 'all' 
    ? places 
    : places.filter(place => place.category?.toLowerCase() === selectedTab.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Places</h2>
        {canEdit && (
          <Button 
            size="sm" 
            className="gap-1"
            onClick={() => handleCreatePlace('New Place', 'attraction')}
          >
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

        <TabsContent value={selectedTab} className="space-y-4">
          <PlaceList
            places={filteredPlaces}
            isLoading={isLoading}
            error={error || undefined}
            onSelectPlace={handlePlaceClick}
          />
        </TabsContent>
      </Tabs>

      {selectedPlace && renderPlaceDetails()}
    </div>
  );
}

export default PlacesTabContent;
