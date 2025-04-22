"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PlusCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { useAuth } from "@/components/auth-provider"
import { EmptyTrips } from "@/components/empty-trips"
import { TripCard } from "@/components/trip-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { SkeletonCard } from "@/components/skeleton-card"

export default function TripsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/trips")
    }
  }, [user, loading, router])

  // Fetch trips
  useEffect(() => {
    if (user) {
      const fetchTrips = async () => {
        try {
          setIsLoading(true)
          setError(null)

          const response = await fetch("/api/trips")

          // If we get a 401, just show empty trips without an error
          if (response.status === 401) {
            setTrips([])
            return
          }

          if (!response.ok) {
            throw new Error(`Failed to fetch trips: ${response.status}`)
          }

          const data = await response.json()
          setTrips(data.trips || [])
        } catch (err: any) {
          console.error("Error fetching trips:", err)
          // Don't show 401 errors
          if (!err.message?.includes("401")) {
            setError(err.message || "Failed to load trips")
            toast({
              title: "Error loading trips",
              description: "Please try again later",
              variant: "destructive",
            })
          }
        } finally {
          setIsLoading(false)
        }
      }

      fetchTrips()
    }
  }, [user, toast])

  // Don't render anything while checking auth
  if (loading || !user) {
    return null
  }

  return (
    <div className="container py-8">
      <PageHeader heading="your travel plans" description="create and manage your group travel itineraries">
        <Link href="/trips/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            new trip
          </Button>
        </Link>
      </PageHeader>

      {error && !error.includes("401") && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : trips.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <EmptyTrips />
      )}
    </div>
  )
}
