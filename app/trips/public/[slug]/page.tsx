"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Users, ArrowLeft, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TripHeader } from "@/components/trip-header"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PublicTripPage(props: { params: { slug: string } }) {
  const { slug } = props.params;
  const router = useRouter()
  const { toast } = useToast()
  const [trip, setTrip] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch public trip data
  useEffect(() => {
    async function fetchTrip() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/trips/public/${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Trip not found or is not public")
          }
          throw new Error(`Failed to fetch trip: ${response.status}`)
        }

        const data = await response.json()
        setTrip(data.trip)
      } catch (err: any) {
        console.error("Error fetching trip:", err)
        setError(err.message || "Failed to load trip details")
        toast({
          title: "Error loading trip",
          description: "This trip may not exist or is not public",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [slug, toast])

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: trip?.title || "Check out this trip!",
          text: `Check out this trip: ${trip?.title}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Trip link copied to clipboard",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
        <div className="h-64 w-full rounded-lg bg-muted animate-pulse"></div>
        <div className="mt-6 h-8 w-1/3 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Trip not found</AlertTitle>
          <AlertDescription>{error || "This trip doesn't exist or is not public."}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <p className="mb-4 text-muted-foreground">Want to plan your own trip?</p>
          <Link href="/trips/create">
            <Button>Create a Trip</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="gap-1" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Link href="/trips/create">
            <Button>Plan Your Own Trip</Button>
          </Link>
        </div>
      </div>

      <TripHeader trip={trip} />

      <div className="flex flex-wrap gap-4 mt-6 mb-8">
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {trip.start_date && trip.end_date
              ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
              : "Dates not set"}
          </span>
        </div>
        {trip.description && (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{trip.description}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{trip.members} travelers</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About this trip</CardTitle>
                <CardDescription>Trip details and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Destination</h3>
                    <p className="text-muted-foreground">
                      {trip.description?.replace("Trip to ", "") || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium">Dates</h3>
                    <p className="text-muted-foreground">
                      {trip.start_date && trip.end_date
                        ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                        : "Dates not set"}
                    </p>
                  </div>

                  {trip.metadata?.vibes && trip.metadata.vibes.length > 0 && (
                    <div>
                      <h3 className="font-medium">Trip Vibes</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {trip.metadata.vibes.map((vibe: string) => (
                          <span key={vibe} className="bg-muted px-2 py-1 rounded-md text-xs">
                            {vibe}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join this adventure</CardTitle>
                <CardDescription>Create your own account to plan trips</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Like what you see? Create your own account to plan trips with friends and family.</p>
                <div className="flex flex-col gap-2">
                  <Link href="/signup">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="itinerary">
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Create an account to see the full itinerary and add your own ideas!
            </p>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="map">
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Create an account to see the trip map and explore locations!</p>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
