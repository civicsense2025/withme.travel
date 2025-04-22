"use client"

import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlaceSearch } from "@/components/place-search"

interface MapTabProps {
  tripId: string
}

export function MapTab({ tripId }: MapTabProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

  // Mock locations for the trip
  const tripLocations = [
    { id: "1", name: "Hotel Arts Barcelona", lat: 41.3866, lng: 2.1943, type: "Accommodation" },
    { id: "2", name: "Sagrada Familia", lat: 41.4036, lng: 2.1744, type: "Activity" },
    { id: "3", name: "El Nacional", lat: 41.3917, lng: 2.168, type: "Food & Dining" },
    { id: "4", name: "La Boqueria Market", lat: 41.3817, lng: 2.1715, type: "Food & Dining" },
    { id: "5", name: "Barceloneta Beach", lat: 41.3792, lng: 2.1917, type: "Activity" },
  ]

  // This would be replaced with actual Google Maps integration
  useEffect(() => {
    if (mapRef.current) {
      // Simulate map initialization
      console.log("Map would initialize here with Google Maps API")
      setMap({
        initialized: true,
        center: { lat: 41.3851, lng: 2.1734 }, // Barcelona coordinates
        zoom: 13,
      })
    }
  }, [mapRef])

  const handleAddPlace = () => {
    if (selectedPlace) {
      console.log("Adding place to trip:", selectedPlace)
      // In a real app, this would save to your database
      setSelectedPlace(null)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Trip Map</CardTitle>
          <CardDescription>View and manage locations for your trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="w-full h-96 bg-muted rounded-md flex items-center justify-center"
            style={{
              backgroundImage: "url('/placeholder.svg?height=400&width=800&query=barcelona map')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-md text-center">
              <p className="font-medium">Google Maps would render here</p>
              <p className="text-sm text-muted-foreground">This is a placeholder for the Google Maps integration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Places</CardTitle>
            <CardDescription>Search for new places to add to your trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PlaceSearch onPlaceSelect={setSelectedPlace} />

            {selectedPlace && (
              <div className="p-4 border rounded-md">
                <h4 className="font-medium">{selectedPlace.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{selectedPlace.address}</p>
                <Button onClick={handleAddPlace} className="w-full">
                  Add to Trip
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Locations</CardTitle>
            <CardDescription>Places included in your itinerary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tripLocations.map((location) => (
                <div
                  key={location.id}
                  className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/50 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.type}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
