"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { API_ROUTES } from "@/utils/constants"
import { useTrips } from "@/hooks/use-trips"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UseTemplateButtonProps {
  templateId: string
  className?: string
}

export function UseTemplateButton({ templateId, className }: UseTemplateButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { trips } = useTrips()
  const [isLoading, setIsLoading] = useState(false)
  const [showTripSelector, setShowTripSelector] = useState(false)

  const handleApplyTemplate = async (tripId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(API_ROUTES.APPLY_TEMPLATE(tripId, templateId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to apply template")
      }

      toast({
        title: "Template Applied",
        description: "The template has been added to your trip's itinerary.",
      })

      // Close the dialog and navigate to the trip's itinerary
      setShowTripSelector(false)
      router.push(`/trips/${tripId}/itinerary`)
    } catch (error) {
      console.error("Error applying template:", error)
      toast({
        title: "Error",
        description: "Failed to apply the template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!trips?.length) {
    return (
      <Button
        className={className}
        onClick={() => router.push("/trips/create")}
      >
        Create a Trip First
      </Button>
    )
  }

  return (
    <Dialog open={showTripSelector} onOpenChange={setShowTripSelector}>
      <DialogTrigger asChild>
        <Button className={className} disabled={isLoading}>
          {isLoading ? "Applying..." : "Use Template"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a Trip</DialogTitle>
          <DialogDescription>
            Choose which trip you want to apply this template to.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] mt-4">
          <div className="space-y-4">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleApplyTemplate(trip.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{trip.title}</CardTitle>
                  <CardDescription>
                    {trip.start_date && new Date(trip.start_date).toLocaleDateString()} -{" "}
                    {trip.end_date && new Date(trip.end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 