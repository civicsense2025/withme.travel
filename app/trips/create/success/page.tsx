"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Globe2, Copy, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

// Trip type definition (simplified for this page)
interface Trip {
  id: string;
  name: string;
  is_public?: boolean;
  // Add other fields as needed for display
}

function TripSuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tripId = searchParams.get("id")

  // Effect 1: Redirect if not logged in (after auth check)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/trips/create") // Redirect to login if not authenticated
    }
  }, [user, authLoading, router])

  // Effect 2: Fetch trip data if logged in and tripId exists
  useEffect(() => {
    // Only fetch if authentication is done, user exists, and tripId is present
    if (!authLoading && user && tripId) {
      setIsLoading(true)
      setError(null) // Reset error before fetching

      async function fetchTrip() {
        try {
          const response = await fetch(`/api/trips/${tripId}`)
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch trip (status ${response.status})`)
          }
          const data = await response.json()
          if (data.trip) {
            setTrip(data.trip)
          } else {
            throw new Error("Trip data not found in API response")
          }
        } catch (err: any) {
          console.error("Error fetching trip:", err)
          setError(err.message || "Failed to load trip details")
          toast({
            title: "Error Loading Trip",
            description: err.message || "Could not load trip details.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchTrip()
    } else if (!tripId) {
      // Handle case where tripId is missing from URL
      setIsLoading(false)
      setError("No trip ID provided.")
    } else if (!authLoading && !user) {
       // Already handled by Effect 1, but set loading false if we somehow get here
       setIsLoading(false)
    }
  }, [user, authLoading, tripId, toast])

  // Render Loading State
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-2xl">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
              <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Render Error State
  if (error) {
     return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-2xl">
          <Card className="border-destructive shadow-md">
            <CardContent className="p-6 text-center">
               <div className="mb-6 flex justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold mb-2 text-destructive">
                Loading Failed
              </h1>
              <p className="text-muted-foreground mb-8">{error}</p>
               <Link href="/">
                  <Button variant="outline" className="w-full">
                    Go to My Trips
                  </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render Success State (only if trip data is loaded)
  if (trip) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-2xl">
          <Card className="border-0 shadow-md gradient-bg-3">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  🎉 Your <span className="gradient-text">trip is born</span>!
                </h1>
                <p className="text-xl mb-8">
                  <span className="font-medium">"{trip.name}"</span> is ready for planning.
                </p>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium">Next steps:</h2>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span>Add places to visit to your itinerary</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span>Invite your travel companions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span>Track your expenses and split costs</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <Link href={`/trips/${trip.id}`}>
                      <Button className="w-full">Go to Trip Details</Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" className="w-full">
                        View All Trips
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Fallback if no trip data and no error (should ideally not be reached)
  return (
     <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-2xl">
          <p>Something went wrong. Please try again later.</p>
          <Link href="/">
              <Button variant="outline" className="mt-4">
                Go to My Trips
              </Button>
          </Link>
        </div>
      </div>
  );
}

// Wrap with Suspense for searchParams
export default function TripSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-2xl">Loading...</div>
      </div>
    }>
      <TripSuccessPageContent />
    </Suspense>
  );
}
