"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PlusCircle, ChevronDown, ChevronUp, Send, X } from "lucide-react";

import MapboxGeocoderComponent from "@/components/maps/mapbox-geocoder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { API_ROUTES } from "@/utils/constants";
import { formatError } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card"; // Use Card for consistent styling
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert components

// Define GeocoderResult locally or import if exported
interface GeocoderResult {
    geometry: { coordinates: [number, number]; type: string };
    place_name: string;
    text: string;
    id?: string; // Mapbox ID
    properties?: { address?: string };
    context?: any;
    [key: string]: any;
}

interface QuickAddItemFormProps {
  tripId: string;
  proximityLat?: number | null;
  proximityLng?: number | null;
}

export function QuickAddItemForm({ tripId, proximityLat, proximityLng }: QuickAddItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State for form expansion and data
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<GeocoderResult | null>(null);

  // --- Handler when a location is selected ---
  const handleGeocoderResult = (result: GeocoderResult | null) => {
    setSelectedPlace(result);
    if (result) {
      // Pre-fill title, expand form
      setTitle(result.text || result.place_name || ""); // Pre-fill title
      setIsExpanded(true); // Expand the form
      setError(null);
    } else {
      // If cleared, optionally collapse or just clear data
      setIsExpanded(false); // Collapse if location is cleared
      resetFormState();
    }
  };

  // --- Reset Form State ---
  const resetFormState = () => {
    setTitle("");
    setType("");
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setNotes("");
    setSelectedPlace(null); // Clear selected place too
    setIsLoading(false);
    setError(null);
    // We might need to clear the Mapbox input programmatically here if it doesnt clear itself
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlace || !type) {
      setError("Location and Type are required.");
      toast({ title: "Missing Info", description: "Please select a location and item type.", variant: "destructive"});
      return;
    }
    setIsLoading(true);
    setError(null);

    const newItemData = {
      title: title || selectedPlace.text || "Itinerary Item", // Fallback title
      type: type,
      date: date ? format(date, "yyyy-MM-dd") : null,
      start_time: startTime || null,
      end_time: endTime || null,
      notes: notes,
      // Location details from selectedPlace state
      place_name: selectedPlace.text,
      address: selectedPlace.properties?.address || selectedPlace.place_name,
      mapbox_id: selectedPlace.id,
      latitude: selectedPlace.geometry?.coordinates[1],
      longitude: selectedPlace.geometry?.coordinates[0],
    };

    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add item.");
      }

      toast({ title: "Item Added!", description: `${newItemData.title} added to itinerary.` });
      setIsExpanded(false); // Collapse form on success
      resetFormState();
      router.refresh(); // Refresh data on the page
    } catch (error: any) {
      console.error("Failed to add quick itinerary item:", error);
      const errMsg = formatError(error);
      setError(errMsg);
      toast({ title: "Failed to Add", description: errMsg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Prepare Mapbox Options ---
  const geocoderOptions: any = {
      placeholder: "Add a place to your itinerary...",
      marker: false // Don't show a marker on the map (if map was present)
  };
  if (proximityLng != null && proximityLat != null) { // Check if coordinates are valid
      geocoderOptions.proximity = [proximityLng, proximityLat];
      console.log("Using proximity:", geocoderOptions.proximity); // Log for debugging
  } else {
      console.log("No proximity used."); // Log for debugging
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Always visible: Location Search */}
          <div className="mb-4">
             <Label htmlFor="quick-add-location" className="sr-only">Location</Label>
             <MapboxGeocoderComponent
                key={selectedPlace ? 'selected' : 'empty'} // Force re-render on selection/clear
                onResult={handleGeocoderResult}
                options={geocoderOptions}
             />
             {!isExpanded && (
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(true)} // Allow manual expansion without location? Maybe not.
                    className="mt-2 text-sm text-muted-foreground"
                    disabled={!selectedPlace} // Only allow manual expand if location chosen? Or remove?
                 >
                     <ChevronDown className="h-4 w-4 mr-1" /> Add Details
                 </Button>
              )}
           </div>


          {/* Conditionally Rendered Fields */}
          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              {error && (
                 <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="quick-add-title">Title</Label>
                <Input
                  id="quick-add-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Dinner at Paella Place"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quick-add-type">Type *</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="quick-add-type">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                   <Label>Date</Label>
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                         {date ? format(date, "PPP") : "Select date"}
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0">
                       <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                     </PopoverContent>
                   </Popover>
                 </div>
                 <div className="space-y-1.5">
                   <Label htmlFor="quick-add-startTime">Start Time</Label>
                   <Input id="quick-add-startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                 </div>
                 <div className="space-y-1.5">
                   <Label htmlFor="quick-add-endTime">End Time</Label>
                   <Input id="quick-add-endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                 </div>
              </div>


              <div className="space-y-1.5">
                <Label htmlFor="quick-add-notes">Notes</Label>
                <Textarea
                  id="quick-add-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Booking reference, details, etc."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsExpanded(false); resetFormState(); /* Also clear Mapbox Input */ }}
                    aria-label="Cancel"
                 >
                    <X className="h-4 w-4 mr-1" /> Cancel
                 </Button>
                 <Button type="submit" size="sm" disabled={isLoading || !type}>
                     {isLoading ? "Adding..." : <><Send className="h-4 w-4 mr-1" /> Add Item</>}
                 </Button>
               </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 