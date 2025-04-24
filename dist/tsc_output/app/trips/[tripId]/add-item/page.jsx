"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { PlaceSearch } from "@/components/place-search";
import Link from "next/link";
export default function AddItineraryItemPage(props) {
    const { tripId } = props.params;
    const router = useRouter();
    const [date, setDate] = useState();
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // In a real app, this would save to your database
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Redirect back to the trip page
        router.push(`/trips/${tripId}`);
    };
    return (<div className="container py-8">
      <div className="mb-6">
        <Link href={`/trips/${tripId}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4"/>
            Back to Trip
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
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Visit Sagrada Familia" required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type"/>
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
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus/>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground"/>
                  <Input id="startTime" type="time"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground"/>
                  <Input id="endTime" type="time"/>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <PlaceSearch onPlaceSelect={setSelectedPlace}/>
              {selectedPlace && (<div className="flex items-center gap-2 mt-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground"/>
                  <span>{selectedPlace.name}</span>
                </div>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost per person ($)</Label>
              <Input id="cost" type="number" min="0" step="0.01" placeholder="25.00"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Any additional details about this item" className="min-h-24"/>
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
    </div>);
}
