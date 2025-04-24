import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { EmptyTrips } from "@/components/empty-trips"
import { Skeleton } from "@/components/ui/skeleton"
import { TripCard } from "@/components/trip-card"
import { ItineraryTemplateCard } from "@/components/itinerary-template-card"
import { 
  DB_TABLES, 
  DB_FIELDS, 
  TRIP_ROLES,
  DB_RELATIONSHIPS,
  PAGE_ROUTES
} from "@/utils/constants"
import { TripWithMemberInfo } from "@/utils/types"

// Force dynamic rendering for this page since it uses cookies and auth
export const dynamic = 'force-dynamic';

// Components for the trips dashboard
const UserTripsSection = async () => {
  const supabase = createClient()
  
  // Use getUser instead of getSession for better security  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error("Auth error in trips page:", userError)
    redirect(`/login?redirect=${encodeURIComponent(PAGE_ROUTES.TRIPS)}`)
    return null
  }

  try {
    // Step 1: Fetch the user's memberships (IDs and roles only initially)
    const { data: memberships, error: membershipError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select("trip_id, role, joined_at, invited_by") // Select only needed fields + trip_id
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      
    if (membershipError) {
      console.error("Error fetching trip memberships:", membershipError)
      return (
        <div className="my-8">
          <p className="text-destructive">Error loading your trips (memberships). Please try again later.</p>
          <pre className="text-xs text-muted-foreground mt-2">{JSON.stringify(membershipError, null, 2)}</pre>
        </div>
      )
    }

    // If no memberships, show empty state early
    if (!memberships || memberships.length === 0) {
      return <EmptyTrips />
    }

    // Step 2: Extract trip IDs and fetch trip details
    const tripIds = memberships.map(m => m.trip_id)
    const { data: tripsData, error: tripsError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select("*") // Select all trip fields needed for TripCard
      .in(DB_FIELDS.TRIPS.ID, tripIds)
      .order(DB_FIELDS.TRIPS.CREATED_AT, { ascending: false }) // Keep consistent ordering if desired

    if (tripsError) {
      console.error("Error fetching trip details:", tripsError)
      return (
        <div className="my-8">
          <p className="text-destructive">Error loading your trip details. Please try again later.</p>
          <pre className="text-xs text-muted-foreground mt-2">{JSON.stringify(tripsError, null, 2)}</pre>
        </div>
      )
    }

    // Step 3: Combine trip data with membership info
    const combinedTripsMap = new Map<string, TripWithMemberInfo>()

    // Create a map of trips by ID for easy lookup
    tripsData.forEach(trip => {
       combinedTripsMap.set(trip.id, {
         ...trip,
         created_by: trip.user_id || user.id, // Adjust logic as needed
         role: 'unknown', // Default role, will be updated
         memberSince: undefined // Default, will be updated
       });
    });

    // Update map with actual role and memberSince from memberships
    memberships.forEach(membership => {
      const trip = combinedTripsMap.get(membership.trip_id);
      if (trip) {
        trip.role = membership.role;
        trip.memberSince = membership.joined_at;
        // If trip.created_by logic needs the invited_by field:
        if (!trip.created_by && membership.invited_by) {
           // This assignment might need adjustment based on your exact definition of `created_by` for TripCard
           // Assuming trip.user_id holds the original creator
           // trip.created_by = trip.user_id || membership.invited_by || user.id;
        }
      }
    });
    
    const combinedTrips = Array.from(combinedTripsMap.values());

    // Separate trips based on role
    const ownedTrips: TripWithMemberInfo[] = []
    const memberTrips: TripWithMemberInfo[] = []

    combinedTrips.forEach(trip => {
      // Use role names consistent with your RLS policies / constants
      if (trip.role === 'admin') { // Adjust 'admin' if your owner role name is different
        ownedTrips.push(trip)
      } else {
        memberTrips.push(trip)
      }
    });

    // If no trips after processing, show empty state
    if (ownedTrips.length === 0 && memberTrips.length === 0) {
      return <EmptyTrips />
    }

    // Render the trips
    return (
      <div className="space-y-10">
        {ownedTrips.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}
        
        {memberTrips.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Trips You're Invited To</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in trips section:", error)
    return (
      <div className="my-8">
        <p className="text-destructive">Something went wrong while loading your trips.</p>
      </div>
    )
  }
}

// Loading fallback for trips
const TripsSectionSkeleton = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold mb-4">Your Trips</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-md" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Fetches itinerary templates to show as quickstart options
const ItineraryTemplatesSection = async () => {
  const supabase = createClient()
  
  try {
    // Fetch public templates
    const { data: templates, error } = await supabase
      .from('itinerary_templates')
      .select(`
        *,
        destinations(*),
        users:created_by(id, full_name, avatar_url)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6)
    
    if (error) {
      console.error("Error fetching templates:", error)
      return (
        <div className="my-4">
          <p className="text-destructive">Error loading itinerary templates.</p>
        </div>
      )
    }

    // No templates found
    if (!templates || templates.length === 0) {
      return null
    }

    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold lowercase">quickstart itineraries</h2>
          <Button
            variant="ghost"
            asChild
            className="lowercase rounded-full hover:bg-travel-purple hover:bg-opacity-20"
          >
            <Link href="/itineraries">
              view all <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template, index) => (
            <ItineraryTemplateCard 
              key={template.id} 
              index={index}
              itinerary={{
                id: template.id,
                title: template.title,
                description: template.description || "",
                image: template.cover_image_url || template.destinations?.image_url || "/placeholder.svg",
                location: template.destinations ? `${template.destinations.city}, ${template.destinations.country}` : "Various locations",
                duration: `${template.duration_days || "N/A"} days`,
                groupSize: template.grouptype || "N/A",
                tags: template.tags || [],
                category: template.category || "uncategorized",
                slug: template.slug || template.id
              }} 
            />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in templates section:", error)
    return null
  }
}

// Main Trips Page
export default async function TripsPage() {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          heading="Your Trips"
          description="Manage and organize your travel adventures"
        />
        <Link href={PAGE_ROUTES.CREATE_TRIP}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Trip
          </Button>
        </Link>
      </div>

      {/* Wrap trips section in Suspense for better loading UX */}
      <Suspense fallback={<TripsSectionSkeleton />}>
        <UserTripsSection />
      </Suspense>

      {/* Itinerary templates as quickstart options */}
      <div className="mt-12">
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
          <ItineraryTemplatesSection />
        </Suspense>
      </div>
    </div>
  )
} 