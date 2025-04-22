"use client"

import { TrendingDestinations } from "@/components/trending-destinations"
import { HeroSection } from "@/components/hero-section"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  PlusCircle, 
  CalendarCheck, 
  MapPin, 
  Plane, 
  ArrowRight,
  UserCircle,
  RefreshCw,
  Bell
} from "lucide-react"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { SkeletonCard } from "@/components/skeleton-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TripCard } from "@/components/trip-card"
import { createClient } from "@/utils/supabase/client"

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

export default function Home() {
  const { user, loading: authLoading } = useAuth()
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
        setRecentTrips(Array.isArray(data.trips) ? data.trips : [])
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

    if (!authLoading) {
      fetchRecentTrips()
      fetchUserProfile()
    }
  }, [user, authLoading, supabase])

  // Render logged-out view (marketing homepage)
  if (!user && !authLoading) {
    return (
      <main className="flex min-h-screen flex-col">
        <HeroSection />
        
        {/* Trending Destinations */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <TrendingDestinations />
          </div>
        </section>

        {/* Features Section - Increased padding and changed layout */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-2">
              plan together, <span className="text-travel-purple dark:text-travel-purple">travel better</span>
            </h2>
            <p className="text-lg mb-16 max-w-2xl mx-auto">
              Everything you need to create amazing group trips without the headaches.
            </p>

            {/* Changed from grid to flex/block layout */}
            <div className="space-y-12 md:space-y-16">
              {/* Row 1: Two items */}
              <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
                <div className="md:w-1/3 bg-card p-6 rounded-lg shadow-sm border">
                  {/* Feature 1: Find cool spots */}
                  <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="text-travel-purple dark:text-travel-purple h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">find cool spots</h3>
                  <p className="text-muted-foreground">
                    Discover and save places everyone will love. No more endless debates about where to go.
                  </p>
                </div>
                <div className="md:w-1/3 bg-card p-6 rounded-lg shadow-sm border">
                  {/* Feature 2: Vote on plans */}
                  <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-travel-purple dark:text-travel-purple"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">vote on plans</h3>
                  <p className="text-muted-foreground">
                    Everyone gets a say. Easily vote on activities, restaurants, and accommodations.
                  </p>
                </div>
              </div>
              
              {/* Row 2: One centered item */}
              <div className="flex justify-center">
                <div className="md:w-1/3 bg-card p-6 rounded-lg shadow-sm border">
                  {/* Feature 3: Build your itinerary */}
                  <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarCheck className="text-travel-purple dark:text-travel-purple h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">build your itinerary</h3>
                  <p className="text-muted-foreground">
                    Create the perfect schedule together. Sync with your calendar so you never miss a thing.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA Section - Increased padding */}
        <section className="py-24 bg-travel-purple/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">ready to start planning?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join withme.travel today and make your next group trip the best one yet.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900">
                  Sign up - it's free
                </Button>
              </Link>
              <Link href="/destinations">
                <Button size="lg" variant="outline" className="rounded-full">
                  Explore destinations
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

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

  // Render logged-in user dashboard
  return (
    <main className="container py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with user profile */}
        <div className="w-full md:w-1/4">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="lowercase text-xl">Welcome back</CardTitle>
              <CardDescription>Here's your travel dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={(user as UserWithMetadata)?.user_metadata?.avatar_url || userProfile?.avatar_url || ''} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium">{userProfile?.name || (user as UserWithMetadata)?.user_metadata?.name || user?.email}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full rounded-full"
                onClick={() => router.push('/settings')}
              >
                <UserCircle className="mr-2 h-4 w-4" />
                View profile
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="lowercase text-xl">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-full"
                onClick={() => router.push('/trips/create')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Plan a new trip
              </Button>
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
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4">
          {/* Recent trips section */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold lowercase">Your recent trips</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>

          {/* Trending destinations */}
          <TrendingDestinations />
        </div>
      </div>
    </main>
  )
}
