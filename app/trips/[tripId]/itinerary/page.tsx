"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItineraryBuilder } from "@/components/itinerary/itinerary-builder"
import { API_ROUTES } from "@/utils/constants"

interface TripItineraryProps {
  params: {
    tripId: string
  }
}

export default function TripItineraryPage(props: TripItineraryProps) {
  const { tripId } = props.params;
  const router = useRouter()
  const [trip, setTrip] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("itinerary")

  useEffect(() => {
    async function fetchTrip() {
      try {
        const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId))
        if (!response.ok) throw new Error("Failed to fetch trip")
        
        const data = await response.json()
        setTrip(data.trip)
      } catch (error) {
        console.error("Error fetching trip:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [tripId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!trip) {
    return <div>Trip not found</div>
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trip Itinerary</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="add">Add Places</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary">
          <Card className="p-6">
            {trip.itinerary_items?.length > 0 ? (
              <div className="space-y-6">
                {/* Group items by day */}
                {Object.entries(
                  trip.itinerary_items.reduce((acc: any, item: any) => {
                    const day = item.metadata?.day_number || 1
                    if (!acc[day]) acc[day] = []
                    acc[day].push(item)
                    return acc
                  }, {})
                ).map(([day, items]: [string, any]) => (
                  <div key={day} className="space-y-4">
                    <h2 className="text-xl font-semibold">Day {day}</h2>
                    <div className="space-y-4">
                      {items.map((item: any) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                              {item.location && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  📍 {item.location}
                                </p>
                              )}
                            </div>
                            {item.start_time && (
                              <span className="text-sm text-muted-foreground">
                                {new Date(item.start_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No itinerary items yet.</p>
                <Button
                  className="mt-4"
                  onClick={() => setActiveTab("add")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Places
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="p-6">
            <ItineraryBuilder
              tripId={tripId}
              destinationId={trip.destination_id}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 