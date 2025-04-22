"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Globe2, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function TripSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, loading } = useAuth()
  const [trip, setTrip] = useState<any>(null)

  const [isLoading, setIsLoading] = useState(true)

  const tripId = searchParams.get("id")

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Fetch trip data
  useEffect(() => {
    if (user && tripId) {
      async function fetchTrip() {
        try {
          const response = await fetch(`/api/trips/${tripId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch trip")
          }

          const data = await response.json()
          setTrip(data.trip)
        } catch (error) {
          console.error("Error fetching trip:", error)
          toast({
            title: "Error",
            description: "Failed to load trip details",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchTrip()
    } else {
      setIsLoading(false)
    }
  }, [user, tripId, toast])

  // Don't render anything while checking auth or loading trip
  if (loading || !user || (isLoading && tripId)) {
    return null
  }

  // If no trip ID was provided, show generic success
  if (!tripId) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-2xl">
          <Card className="border-0 shadow-md gradient-bg-3">
            <CardContent className="p-6 text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                🎉 Your <span className="gradient-text">trip is born</span>!
              </h1>
              <p className="text-muted-foreground mb-8">Your adventure is ready for planning.</p>

              <div className="flex flex-col gap-4">
                <Link href="/trips">
                  <Button className="w-full">Go to My Trips</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
                <span className="font-medium">"{trip?.title}"</span> is ready for planning.
              </p>

              {trip?.is_public && trip?.public_url && (
                <div className="mb-8 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe2 className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Public Trip Link</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs bg-background p-2 rounded flex-1 overflow-hidden text-ellipsis">
                      {`${window.location.origin}/trips/public/${trip.public_url}`}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/trips/public/${trip.public_url}`)
                        toast({
                          title: "Link copied!",
                          description: "Public trip link copied to clipboard",
                        })
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with anyone - they can view your trip without needing an account
                  </p>
                </div>
              )}

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
                  <Link href={`/trips/${tripId}`}>
                    <Button className="w-full">Go to Trip Details</Button>
                  </Link>
                  <Link href="/trips">
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
