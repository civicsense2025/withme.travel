"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  PlusCircle, 
  AlertCircle, 
  CalendarCheck, 
  MapPin, 
  Plane, 
  Clock, 
  RefreshCw,
  Filter,
  Search,
  Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { useAuth } from "@/components/auth-provider"
import { TripCard } from "@/components/trip-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { SkeletonCard } from "@/components/skeleton-card"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Trip type definition
interface Trip {
  id: string
  name: string
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
  updated_at: string
  created_by: string
  
  // Fields added by the API
  title?: string
  description?: string
  cover_image?: string
  members?: number
}

// Quick start templates
const quickStartTemplates = [
  {
    title: "Start From Scratch",
    description: "Build your perfect trip itinerary step-by-step.",
    icon: <Plane className="h-8 w-8 text-primary mb-3" />,
    href: "/trips/create",
  },
  {
    title: "Explore Destinations",
    description: "Get inspired and discover amazing places to visit.",
    icon: <MapPin className="h-8 w-8 text-primary mb-3" />,
    href: "/destinations",
  },
  {
    title: "Weekend Getaway",
    description: "Quickly set up a short trip for the weekend.",
    icon: <CalendarCheck className="h-8 w-8 text-primary mb-3" />,
    href: "/trips/create?template=weekend",
  },
]

// Template sections
const EmptyStateView = () => (
  <div className="mt-12 text-center">
    <h2 className="text-2xl font-bold lowercase tracking-tight mb-4">
      ready for your next adventure?
    </h2>
    <p className="text-muted-foreground mb-8">
      start planning your next group trip with a template or from scratch.
    </p>
    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {quickStartTemplates.map((template) => (
        <Link href={template.href} key={template.title}>
          <Card className="text-left h-full hover:bg-accent transition-colors duration-200 cursor-pointer">
            <CardHeader>
              {template.icon}
              <CardTitle className="text-lg lowercase">{template.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{template.description}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  </div>
)

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest")
  const [filterType, setFilterType] = useState<"all" | "upcoming" | "past" | "planning">("all")
  const [activeTab, setActiveTab] = useState<"cards" | "list">("cards")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const fetchTrips = useCallback(async () => {
    if (!user) return // Don't fetch if user is not logged in

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/trips")
      if (!response.ok) {
        // Handle specific auth error
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.")
          setTrips([])
          router.push('/login?redirect=/trips'); // Redirect to login
          return;
        }
        throw new Error(`Failed to fetch trips: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
         throw new Error(data.error)
      }
      
      console.log("Fetched trips:", data.trips); // Log fetched data
      setTrips(data.trips || [])

    } catch (err: any) {
      console.error("[TripsPage] Error fetching trips:", err)
      setError(err.message || "Failed to load trips")
      setTrips([]) // Clear trips on error
      toast({
        title: "Error loading trips",
        description: "Please try refreshing the page or log in again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, router, toast])

  // Effect to handle auth state changes and initial fetch
  useEffect(() => {
    // If auth is still loading, wait.
    if (authLoading) {
      setIsLoading(true); // Keep the page loading state true while auth loads
      return;
    }

    // If auth finished loading and there's no user, redirect.
    if (!user) {
      router.push("/login?redirect=/trips");
      return; // Stop further execution in this effect run
    }

    // If auth finished loading and there IS a user, fetch trips.
    fetchTrips();

  }, [user, authLoading, router, fetchTrips]); // Depend on user and authLoading

  // Filter & sort logic
  useEffect(() => {
    if (!trips.length) {
      setFilteredTrips([])
      return
    }

    let result = [...trips]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(trip => 
        trip.name.toLowerCase().includes(term) || 
        trip.destination_name?.toLowerCase().includes(term)
      )
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      const now = new Date()
      
      if (filterType === 'upcoming') {
        result = result.filter(trip => 
          trip.start_date && new Date(trip.start_date) > now
        )
      } else if (filterType === 'past') {
        result = result.filter(trip => 
          trip.end_date && new Date(trip.end_date) < now
        )
      } else if (filterType === 'planning') {
        result = result.filter(trip => 
          trip.date_flexibility === 'undecided' || !trip.start_date || !trip.end_date
        )
      }
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    }
    
    setFilteredTrips(result)
  }, [trips, searchTerm, sortBy, filterType])

  // Handle refresh button
  const handleRefresh = () => {
    fetchTrips()
  }

  // Clear auth cookies and redirect to login
  const handleClearCookies = async () => {
    try {
      toast({
        title: "Clearing cookies...",
        description: "This will fix authentication issues but require you to log in again.",
      })
      
      // Use our improved auth helper
      import('@/utils/auth-helper').then(({ clearAuthState }) => {
        clearAuthState().then(() => {
          // Redirect to login
          router.push("/login?redirect=/trips&reason=cookies_reset")
        })
      }).catch(() => {
        // Fallback to the API approach if the import fails
        fetch("/api/auth/clear-cookies").then(() => {
          router.push("/login?redirect=/trips&reason=cookies_reset")
        })
      })
    } catch (error) {
      console.error("Error clearing cookies:", error)
      toast({
        title: "Error clearing cookies",
        description: "Please try signing out and in again manually",
        variant: "destructive",
      })
    }
  }

  // Render Loading State
  if (authLoading || isLoading) {
    return (
      <div className="container py-10">
        <PageHeader
          heading="your travel plans"
          description="create and manage your group travel itineraries"
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  // Render Error State
  if (error) {
    return (
      <div className="container py-10">
        <PageHeader
          heading="your travel plans"
          description="create and manage your group travel itineraries"
        />
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Trips</AlertTitle>
          <AlertDescription>
            {error}. Please try refreshing the page. If the problem persists, try logging out and back in.
            <Button variant="link" onClick={() => fetchTrips()} className="ml-2 p-0 h-auto">Retry</Button>
          </AlertDescription>
        </Alert>
         {/* Still show EmptyStateView as a fallback */}
         <EmptyStateView />
      </div>
    )
  }

  // Render Content (Empty or Trips List)
  return (
    <div className="container py-10">
      <PageHeader
        heading="your travel plans"
        description="create and manage your group travel itineraries"
      />

      {trips.length === 0 ? (
        <EmptyStateView />
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
            />
          ))}
        </div>
      )}
    </div>
  )
}
