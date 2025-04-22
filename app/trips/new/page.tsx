"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { LocationSearch } from "@/components/location-search"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function NewTripPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: searchParams.get("destination") || "",
    placeId: searchParams.get("placeId") || "",
    totalBudget: "",
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, router])

  // Set title based on destination
  useEffect(() => {
    if (formData.destination && !formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: `Trip to ${formData.destination.split(",")[0]}`,
        description: `Exploring ${formData.destination}`,
      }))
    }
  }, [formData.destination])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationSelect = (location: { name: string; placeId: string }) => {
    setFormData((prev) => ({
      ...prev,
      destination: location.name,
      placeId: location.placeId,
      title: `Trip to ${location.name.split(",")[0]}`,
      description: `Exploring ${location.name}`,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!startDate || !endDate) {
        throw new Error("Please select start and end dates")
      }

      const tripData = {
        title: formData.title,
        description: formData.description,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        total_budget: formData.totalBudget ? Number.parseFloat(formData.totalBudget) : null,
        cover_image: getCoverImageForDestination(formData.destination),
      }

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create trip")
      }

      const { trip } = await response.json()

      toast({
        title: "Trip created!",
        description: "Your new trip has been created successfully.",
      })

      // Redirect to the trip page
      router.push(`/trips/${trip.id}`)
    } catch (error: any) {
      console.error("Error creating trip:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create trip",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to get a cover image based on destination
  function getCoverImageForDestination(destination: string): string {
    const lowerDest = destination.toLowerCase()
    if (lowerDest.includes("barcelona")) return "/barceloneta-sand-and-sea.png"
    if (lowerDest.includes("tokyo")) return "/tokyo-twilight.png"
    if (lowerDest.includes("california")) return "/california-highway-one.png"
    return "/tropical-beach-getaway.png"
  }

  if (!user) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="container py-8">
      <PageHeader heading="Create a New Trip" description="Plan your next adventure with friends and family" />

      <Card className="max-w-2xl mx-auto mt-8">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="lowercase">Trip Details</CardTitle>
            <CardDescription className="lowercase">Fill in the basic information about your trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <LocationSearch
                placeholder="Search for a destination"
                buttonText="Set"
                onLocationSelect={handleLocationSelect}
              />
              {formData.destination && (
                <p className="text-sm text-muted-foreground mt-2">Selected destination: {formData.destination}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Trip Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Summer in Barcelona"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A week exploring Barcelona's beaches and architecture"
                className="min-h-24"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget ($)</Label>
              <Input
                id="totalBudget"
                name="totalBudget"
                type="number"
                min="0"
                placeholder="5000"
                value={formData.totalBudget}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/")} className="lowercase">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="lowercase">
              {isSubmitting ? "Creating..." : "Create Trip"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
