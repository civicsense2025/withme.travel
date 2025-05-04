'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { API_ROUTES } from '@/utils/constants/routes';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin } from 'lucide-react';

type GoogleMapsUrlImportProps = {
  tripId: string;
  onSuccess?: () => void;
  onClose?: () => void;
};

// Define a type for place data
type Place = {
  title: string;
  address: string;
  category: string | null;
  description: string | null;
  placeId: string | null;
  latitude: number | null;
  longitude: number | null;
  rating?: number | null;
  reviews?: number | null;
  selected: boolean;
};

export default function GoogleMapsUrlImport({
  tripId,
  onSuccess,
  onClose,
}: GoogleMapsUrlImportProps) {
  const [url, setUrl] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [listTitle, setListTitle] = useState<string | null>(null);

  // Computed property for select all checkbox
  const allSelected = places.length > 0 && places.every((place) => place.selected);
  
  // Determines if the URL input is valid
  const isValidUrl = url.trim().length > 0 && (
    url.includes('goo.gl/maps') || 
    url.includes('google.com/maps') || 
    url.includes('maps.app.goo.gl')
  );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear preview if URL changes
    if (previewMode) {
      setPreviewMode(false);
      setPlaces([]);
      setListTitle(null);
    }
  };

  const handlePreview = async () => {
    if (!isValidUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Maps URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/google-maps/parse?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Could not parse Google Maps list');
      }

      // Initialize places with selected flag
      setPlaces(
        data.places.map((place: Omit<Place, 'selected'>) => ({
          ...place,
          selected: true,
        }))
      );
      setListTitle(data.listTitle || null);
      setPreviewMode(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to parse Google Maps list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    setPlaces(
      places.map((place) => ({
        ...place,
        selected: !allSelected,
      }))
    );
  };

  const handleTogglePlace = (index: number) => {
    setPlaces(
      places.map((place, i) =>
        i === index ? { ...place, selected: !place.selected } : place
      )
    );
  };

  const handleImport = async () => {
    const selectedPlaces = places.filter((place) => place.selected);
    
    if (selectedPlaces.length === 0) {
      toast({
        title: "No places selected",
        description: "Please select at least one place to import",
        variant: "destructive",
      });
      return;
    }

    setImportLoading(true);
    try {
      // Use the direct import endpoint instead of manually adding items
      const response = await fetch(`/api/trips/${tripId}/import-google-maps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to import places');
      }

      toast({
        title: "Success",
        description: data.message || `Added ${selectedPlaces.length} places to your trip`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import places to your trip",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      <div>
        <Label htmlFor="google-maps-url">Google Maps List URL</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="google-maps-url"
            placeholder="https://goo.gl/maps/example123"
            value={url}
            onChange={handleUrlChange}
            disabled={loading || importLoading}
          />
          <Button 
            onClick={handlePreview} 
            disabled={loading || !isValidUrl}
            variant="secondary"
          >
            {loading ? "Loading..." : "Preview"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Paste a Google Maps list URL to import places to your trip
        </p>
      </div>

      {previewMode && places.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">
              {listTitle ? `"${listTitle}"` : "Places from Google Maps"}
            </h3>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="select-all" 
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="cursor-pointer">
                Select All
              </Label>
            </div>
          </div>

          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            <ul className="divide-y">
              {places.map((place, index) => (
                <li 
                  key={place.placeId || index} 
                  className="p-3 hover:bg-muted flex items-start gap-3"
                >
                  <Checkbox
                    id={`place-${index}`}
                    checked={place.selected}
                    onCheckedChange={() => handleTogglePlace(index)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{place.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {place.address}
                    </div>
                    {place.category && (
                      <div className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full inline-block mt-1">
                        {place.category}
                      </div>
                    )}
                    {place.rating && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ★ {place.rating} {place.reviews && `(${place.reviews})`}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={importLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={importLoading || places.filter(p => p.selected).length === 0}
            >
              {importLoading 
                ? "Importing..." 
                : `Import ${places.filter(p => p.selected).length} Places`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
