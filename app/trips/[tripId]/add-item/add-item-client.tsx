'use client';

import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import MapboxGeocoderComponent from '@/components/maps/mapbox-geocoder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleMapsUrlImport from '../google-maps-url-import';

// Define a local formatError function since it's not available in utils
function formatError(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'An unknown error occurred';
}

interface DestinationInfo {
  id: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  mapbox_id: string | null;
}

interface AddItineraryItemClientProps {
  tripId: string;
  initialDestination: DestinationInfo | null;
}

interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string;
  properties?: { address?: string };
  [key: string]: any;
}

export function AddItineraryItemClient({
  tripId,
  initialDestination,
}: AddItineraryItemClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [selectedPlace, setSelectedPlace] = useState<GeocoderResult | null>(
    initialDestination
      ? {
          text: initialDestination.city || 'Unknown Location',
          place_name:
            initialDestination.city && initialDestination.country
              ? `${initialDestination.city}, ${initialDestination.country}`
              : initialDestination.city || initialDestination.country || 'Unknown Address',
          id: initialDestination.mapbox_id || undefined,
          geometry: {
            coordinates: [initialDestination.longitude ?? 0, initialDestination.latitude ?? 0],
            type: 'Point',
          },
        }
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Define proximity value explicitly
  let proximityValue: [number, number] | undefined = undefined;
  if (initialDestination?.longitude != null && initialDestination?.latitude != null) {
    proximityValue = [initialDestination.longitude, initialDestination.latitude];
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    const newItemData = {
      title: formValues.title,
      type: formValues.type,
      date: date ? format(date, 'yyyy-MM-dd') : null,
      start_time: formValues.startTime || null,
      end_time: formValues.endTime || null,
      estimated_cost: formValues.cost ? parseFloat(formValues.cost as string) : null,
      notes: formValues.notes,
      ...(selectedPlace
        ? {
            place_name: selectedPlace.text,
            address: selectedPlace.place_name,
            mapbox_id: selectedPlace.id,
            latitude: selectedPlace.geometry?.coordinates[1],
            longitude: selectedPlace.geometry?.coordinates[0],
          }
        : {}),
    };

    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add item. Please check the details.');
      }

      toast({
        title: 'Item Added!',
        description: `${newItemData.title} has been added to the itinerary.`,
        variant: 'default',
      });

      router.push(`/trips/${tripId}?tab=itinerary`);
      router.refresh();
    } catch (error: any) {
      console.error('Failed to add itinerary item:', error);
      const errMsg = formatError(error);
      setErrorMessage(errMsg);
      toast({
        title: 'Failed to Add Item',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeocoderResult = (result: GeocoderResult | null) => {
    console.log('Geocoder Result:', result);
    setSelectedPlace(result);
  };

  const handleGoogleMapsImport = (place: any) => {
    // Implementation of handleGoogleMapsImport
  };

  return (
    <div className="container max-w-screen-md py-8">
      <div className="mb-6">
        <Link href={`/trips/${tripId}?tab=itinerary`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Itinerary
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="quickAdd" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quickAdd">Bulk Add Places</TabsTrigger>
          <TabsTrigger value="googleMaps">Google Maps URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quickAdd" className="py-6">
          <Card className="max-w-2xl mx-auto">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setErrorMessage(null);
                const formData = new FormData(e.currentTarget);
                const rawInput = formData.get('bulkPlaces') as string;
                const lines = rawInput
                  .split('\n')
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0);
                if (lines.length === 0) {
                  setErrorMessage('Please enter at least one place name.');
                  setIsSubmitting(false);
                  return;
                }
                // Call backend API to resolve all names (implement this route)
                try {
                  const response = await fetch(`/api/trips/${tripId}/bulk-places-search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ names: lines }),
                  });
                  const data = await response.json();
                  if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to search places.');
                  }
                  // TODO: Show confirmation UI for user to select which places to import
                  // For now, just show a toast and reset
                  toast({
                    title: 'Places Found',
                    description: `Found ${data.places.length} places. (Confirmation UI coming soon)`
                  });
                  setIsSubmitting(false);
                  e.currentTarget.reset();
                } catch (err: any) {
                  setErrorMessage(formatError(err));
                  setIsSubmitting(false);
                }
              }}
            >
              <CardHeader>
                <CardTitle>Bulk Add Places</CardTitle>
                <CardDescription>
                  Paste or type multiple place names (one per line) to search and import them in bulk.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="bulkPlaces">Place Names</Label>
                  <Textarea
                    id="bulkPlaces"
                    name="bulkPlaces"
                    placeholder="E.g. Eiffel Tower\nLouvre Museum\nNotre Dame Cathedral"
                    rows={8}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Searching...' : 'Search & Import'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="googleMaps" className="py-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Import from Google Maps</CardTitle>
              <CardDescription>
                Paste a Google Maps URL to import places to your trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMapsUrlImport 
                tripId={tripId} 
                onSuccess={() => router.push(`/trips/${tripId}?tab=itinerary`)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
