"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import type { AuthContextType } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  PlusCircle, 
  CalendarCheck, 
  MapPin, 
  ArrowRight,
  UserCircle
} from "lucide-react"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card"
import { SkeletonCard } from "@/components/skeleton-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TripCard } from "@/components/trip-card"
import { createClient } from "@/utils/supabase/client"
import TravelTracker from '@/components/TravelTracker'
import { TrendingDestinations } from "@/components/trending-destinations"
import type { TripRole } from "@/utils/constants"

// Trip type definition - simplified version of the one in trips/page.tsx
interface Trip {
  id: string
  name: string
  created_by: string
  destination_id?: string
  destination_name?: string
  start_date?: string
  end_date?: string
  date_flexibility?: string
  travelers_count?: number
  vibe?: string
  budget?: string
  is_public: boolean
  slug?: string
  cover_image_url?: string
  created_at: string
  updated_at?: string
  
  // Fields added by the API
  title?: string
  description?: string
  cover_image?: string
  members?: number
  role: TripRole | null
}

// User type with metadata
interface UserWithMetadata {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth() as AuthContextType
  const router = useRouter()
  const supabase = createClient()
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [isLoadingTrips, setIsLoadingTrips] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Fetch recent trips for logged in users
  useEffect(() => {
    async function fetchRecentTrips() {
      if (!user) {
        setRecentTrips([])
        setIsLoadingTrips(false)
        return
      }

      try {
        setIsLoadingTrips(true)
        const response = await fetch("/api/trips?limit=3&sort=newest", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache"
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch trips: ${response.status}`)
        }

        const data = await response.json()
        // Ensure each trip has a role property
        const trips = Array.isArray(data.trips) 
          ? data.trips.map((trip: any) => ({ ...trip, role: trip.role || null }))
          : []
        setRecentTrips(trips)
      } catch (error) {
        console.error("Error fetching recent trips:", error)
        setRecentTrips([])
      } finally {
        setIsLoadingTrips(false)
      }
    }

    // Fetch user profile for logged in users
    async function fetchUserProfile() {
      if (!user) {
        setUserProfile(null)
        setIsLoadingProfile(false)
        return
      }

      try {
        setIsLoadingProfile(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    // Redirect if not logged in (handle potential race condition with authLoading)
    if (!authLoading && !user) {
      router.push('/login'); // Or '/' depending on desired behavior
      return; 
    }

    if (user) {
      fetchRecentTrips()
      fetchUserProfile()
    }
  }, [user, authLoading, supabase, router])

  // Show loading state while checking auth or fetching data
  if (authLoading || (user && (isLoadingTrips || isLoadingProfile))) {
    return (
      <main className="container py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <Card className="bg-muted animate-pulse h-48"></Card>
          </div>
          <div className="w-full md:w-3/4">
            <div className="h-12 bg-muted animate-pulse rounded-md mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Ensure user is loaded before rendering dashboard content
  if (!user) {
      // This should ideally not be reached if the useEffect redirect works,
      // but it's a fallback. Could return null or a redirect component.
      return null; 
  }
  
  // Render logged-in user dashboard
  return (
    <main className="container py-12 md:py-16">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Sidebar with user profile */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="lowercase text-xl font-semibold">Welcome back</CardTitle>
              <CardDescription>Here's your travel dashboard</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={(user as UserWithMetadata)?.user_metadata?.avatar_url || userProfile?.avatar_url || ''} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold">{userProfile?.name || (user as UserWithMetadata)?.user_metadata?.name || user?.email}</h3>
                <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
              <Button 
                variant="outline" 
                  className="w-full rounded-full mt-2"
                onClick={() => router.push('/settings')}
              >
                <UserCircle className="mr-2 h-4 w-4" />
                View profile
              </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="lowercase text-xl font-semibold">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {user ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full"
                  onClick={() => router.push('/trips/create')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Plan a new trip
                </Button>
              ) : (
                // This part might be redundant now as we expect user to exist here
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full"
                  onClick={() => router.push('/login?redirect=/trips/create')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Sign in to plan a trip
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-full"
                onClick={() => router.push('/destinations')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Explore destinations
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-full"
                onClick={() => router.push('/itineraries')}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                Browse itineraries
              </Button>
            </CardContent>
          </Card>

          {/* Travel Tracker moved to sidebar */}
          <div className="mt-8">
            <TravelTracker />
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          {/* Recent trips section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold lowercase">Your recent trips</h2>
              <Button
                variant="ghost"
                onClick={() => router.push("/trips")}
                className="lowercase rounded-full hover:bg-travel-purple/20"
              >
                view all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {recentTrips.length === 0 ? (
              <Card className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't created any trips yet. Start planning your next adventure!
                </p>
                <Button 
                  onClick={() => router.push('/trips/create')} 
                  className="rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Plan your first trip
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentTrips.map((trip) => (
                  <TripCard key={trip.id} trip={{...trip, role: 'admin'}} />
                ))}
              </div>
            )}
          </div>

          {/* Trending destinations - Kept for dashboard */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold lowercase">Trending destinations</h2>
                <p className="text-muted-foreground">discover popular places loved by our community</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => router.push("/destinations")}
                className="lowercase rounded-full hover:bg-travel-purple/20"
              >
                view all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrendingDestinations />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 