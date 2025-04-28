"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarIcon, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, formatError } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import MapboxGeocoderComponent from "@/components/maps/mapbox-geocoder"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormControl, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { API_ROUTES, PAGE_ROUTES } from "@/utils/constants"

interface DestinationInfo {
  id: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
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

export function AddItineraryItemClient({ tripId, initialDestination }: AddItineraryItemClientProps) {
  const router = useRouter()
  const { toast } = useToast();
  const [date, setDate] = useState<Date>()
  const [selectedPlace, setSelectedPlace] = useState<GeocoderResult | null>(initialDestination ? {
    text: initialDestination.city || 'Unknown Location',
    place_name: initialDestination.city && initialDestination.country ? `${initialDestination.city}, ${initialDestination.country}` : (initialDestination.city || initialDestination.country || 'Unknown Address'),
    id: initialDestination.google_place_id || undefined,
    geometry: {
      coordinates: [initialDestination.longitude ?? 0, initialDestination.latitude ?? 0],
      type: 'Point'
    },
  } : null);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Define proximity value explicitly
  let proximityValue: [number, number] | undefined = undefined;
  if (initialDestination?.longitude != null && initialDestination?.latitude != null) {
    proximityValue = [initialDestination.longitude, initialDestination.latitude];
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
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
      ...(selectedPlace ? {
        place_name: selectedPlace.text,
        address: selectedPlace.place_name,
        mapbox_id: selectedPlace.id,
        latitude: selectedPlace.geometry?.coordinates[1],
        longitude: selectedPlace.geometry?.coordinates[0],
      } : {}),
    };

    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add item. Please check the details.");
      }

      toast({
        title: "Item Added!",
        description: `${newItemData.title} has been added to the itinerary.`,
        variant: "default",
      });

      router.push(`/trips/${tripId}?tab=itinerary`); 
      router.refresh();
      
    } catch (error: any) {
      console.error("Failed to add itinerary item:", error);
      const errMsg = formatError(error);
      setErrorMessage(errMsg);
      toast({
        title: "Failed to Add Item",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGeocoderResult = (result: GeocoderResult) => {
    console.log("Geocoder Result:", result);
    setSelectedPlace(result);
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href={`/trips/${tripId}?tab=itinerary`}> 
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Itinerary
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Add Itinerary Item</CardTitle>
            <CardDescription>Add a new activity, accommodation, or transportation to your trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Visit Sagrada Familia" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input id="startTime" name="startTime" type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input id="endTime" name="endTime" type="time" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <MapboxGeocoderComponent
                onResult={handleGeocoderResult}
                options={{
                   proximity: proximityValue,
                  // types: 'poi,address,place',
                } as any}
              />
              {selectedPlace && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedPlace.text || selectedPlace.place_name || 'Selected Location'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Estimated Cost (per person)</Label>
              <Input id="cost" name="cost" type="number" min="0" step="0.01" placeholder="25.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any additional details about this item" className="min-h-24" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add to Itinerary"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 