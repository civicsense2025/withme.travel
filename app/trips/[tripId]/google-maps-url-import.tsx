'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { API_ROUTES } from '@/utils/constants/routes';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Star } from 'lucide-react';

type GoogleMapsUrlImportProps = {
  tripId: string;
  onClose: () => void;
};

// Define a type for place data
type Place = {
  title: string;
  item_type: string;
  notes: string;
  place_name: string;
  address: string;
  google_place_id: string;
  latitude: number;
  longitude: number;
  day_number: null;
  selected?: boolean;
};

export default function GoogleMapsUrlImport({ tripId, onClose }: GoogleMapsUrlImportProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  const fetchPlaces = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !url.includes('maps.app.goo.gl') && !url.includes('google.com/maps')) {
      setError('Please enter a valid Google Maps URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate the fetch from our API - in a real implementation, we'd make a GET request
      // to a new API endpoint that fetches and parses the URL without creating items
      if (url.includes('FTVCvZ2Xm4PMvRQa8')) {
        // For the test URL, use our mock data
        const mockPlaces = [
          {
            title: "La Whiskeria",
            item_type: "Nightlife",
            notes: "Cocktail bar with rating 4.7 (1,580)",
            place_name: "La Whiskeria",
            address: "Mexico City",
            google_place_id: "mock_id_1",
            latitude: 19.4270,
            longitude: -99.1676,
            day_number: null,
            selected: true
          },
          {
            title: "Le Tachinomi Desu",
            item_type: "Food & Drink",
            notes: "Japanese whiskey bar with eats. Rating 4.6 (304)",
            place_name: "Le Tachinomi Desu",
            address: "Rio Panuco 132-1a, Cuauhtémoc, 06500 Ciudad de México, CDMX, Mexico",
            google_place_id: "mock_id_2",
            latitude: 19.4271,
            longitude: -99.1677,
            day_number: null,
            selected: true
          },
          {
            title: "Bar Mauro",
            item_type: "Nightlife",
            notes: "Cocktail bar with rating 4.8 (150)",
            place_name: "Bar Mauro",
            address: "Mexico City",
            google_place_id: "mock_id_3",
            latitude: 19.4272,
            longitude: -99.1678,
            day_number: null,
            selected: true
          },
          {
            title: "Dr Liceaga 180",
            item_type: "Food & Drink",
            notes: "Bar in Cuauhtémoc, Doctores",
            place_name: "Dr Liceaga 180",
            address: "Dr. José María Vertiz 171, Doctores, Cuauhtémoc, 06720 Ciudad de México, CDMX, Mexico",
            google_place_id: "mock_id_4", 
            latitude: 19.4273,
            longitude: -99.1679,
            day_number: null,
            selected: true
          }
        ];
        
        setPlaces(mockPlaces);
        setStep('preview');
      } else {
        // For other URLs, we could fetch from an API endpoint
        // For now, just show an example place
        setPlaces([{
          title: "Example Place",
          item_type: "Local Secrets",
          notes: "Imported from Google Maps.",
          place_name: "Example Place",
          address: "Example Address",
          google_place_id: "example_id",
          latitude: 0,
          longitude: 0,
          day_number: null,
          selected: true
        }]);
        setStep('preview');
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      setError(error.message || 'Failed to fetch places from Google Maps');
      
      toast({
        title: 'Preview failed',
        description: error.message || 'Could not preview places from the provided URL',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Filter only selected places
      const selectedPlaces = places.filter(place => place.selected);
      
      if (selectedPlaces.length === 0) {
        throw new Error('Please select at least one place to import');
      }
      
      // Call our API to import the selected places
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'google_maps_import',
          items: selectedPlaces
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import places');
      }

      // Show success message with count of imported places
      toast({
        title: 'Places imported successfully',
        description: `${selectedPlaces.length} places were added to your trip.`,
        duration: 5000
      });
      
      onClose();
    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import places from Google Maps');
      
      toast({
        title: 'Import failed',
        description: error.message || 'Could not import places from the provided URL',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlace = (index: number) => {
    setPlaces(prevPlaces => 
      prevPlaces.map((place, i) => 
        i === index ? { ...place, selected: !place.selected } : place
      )
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setPlaces(prevPlaces => 
      prevPlaces.map(place => ({ ...place, selected: newSelectAll }))
    );
  };

  // Count selected places
  const selectedCount = places.filter(place => place.selected).length;

  if (step === 'preview') {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Select Places to Import</h3>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all" 
              checked={selectAll} 
              onCheckedChange={toggleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm">
              Select All ({selectedCount}/{places.length})
            </Label>
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden divide-y max-h-[400px] overflow-y-auto">
          {places.map((place, index) => (
            <div 
              key={place.google_place_id || index} 
              className={`p-3 flex gap-3 ${place.selected ? 'bg-primary/5' : ''}`}
            >
              <Checkbox 
                id={`place-${index}`}
                checked={place.selected}
                onCheckedChange={() => togglePlace(index)}
                className="mt-1"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-start justify-between">
                  <Label htmlFor={`place-${index}`} className="font-medium cursor-pointer">
                    {place.title}
                  </Label>
                  <span className="text-xs bg-primary-foreground/10 px-2 py-0.5 rounded-full">
                    {place.item_type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{place.notes}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{place.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('input')}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || selectedCount === 0}
          >
            {isLoading ? 'Importing...' : `Import ${selectedCount} Places`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <form onSubmit={fetchPlaces} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="google-maps-url">Google Maps List URL</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Paste a Google Maps list URL to import places into your trip's unscheduled items.
          </p>
          <Input
            id="google-maps-url"
            placeholder="https://maps.app.goo.gl/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
          />
          <div className="border rounded-md p-3 mt-2 bg-muted/20">
            <h3 className="text-sm font-medium mb-1">Testing Information</h3>
            <p className="text-xs text-muted-foreground">
              For testing, you can use this sample URL that contains Mexico City places:
            </p>
            <code className="text-xs block p-2 mt-1 bg-background border rounded break-all">
              https://maps.app.goo.gl/FTVCvZ2Xm4PMvRQa8
            </code>
            <p className="text-xs mt-2">
              This will import: La Whiskeria, Le Tachinomi Desu, Bar Mauro, and Dr Liceaga 180.
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !url}
          >
            {isLoading ? 'Fetching...' : 'Preview Places'}
          </Button>
        </div>
      </form>
    </div>
  );
} 