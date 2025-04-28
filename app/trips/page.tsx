'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import { EmptyTrips } from '@/components/empty-trips'
import { Skeleton } from '@/components/ui/skeleton'
import { TripCard } from '@/components/trip-card'
import { ClassErrorBoundary } from '@/components/error-boundary'
import { DB_TABLES, DB_FIELDS, PAGE_ROUTES, TripRole } from '@/utils/constants'
import type { TripWithMemberInfo } from '@/utils/types'

// force dynamic because we rely on cookies/auth state
export const dynamic = 'force-dynamic'

// helper to ensure we only redirect to internal pages
const safeRedirect = (path: string) => {
  const allowed = [PAGE_ROUTES.TRIPS, '/login']
  return allowed.includes(path) ? path : PAGE_ROUTES.TRIPS
}

// Type for a trip member row from the database
interface TripMemberRow {
  role: TripRole | null
  joined_at: string | null
  trip: {
    id: string
    name: string
    start_date: string | null
    end_date: string | null
    created_at: string
    status: string | null
    destination_id: string | null
    destination_name: string | null
    cover_image_url: string | null
    created_by: string | null
    is_public: boolean
    privacy_setting: string | null
    description: string | null
  } | null
}

// Fetcher function for SWR
// Explicitly type the return value of the fetcher
const fetchTrips = async (): Promise<{ rows: TripMemberRow[], userId: string }> => {
  const supabase = createClient()
  
  // Get current user
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) {
    throw new Error('Not authenticated')
  }
  const userId = userData.user.id

  // Join TRIP_MEMBERS → TRIPS in one call
  const { data, error: fetchErr } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select(`
      ${DB_FIELDS.TRIP_MEMBERS.ROLE},
      ${DB_FIELDS.TRIP_MEMBERS.JOINED_AT},
      trip:${DB_TABLES.TRIPS} (
        ${DB_FIELDS.TRIPS.ID}, ${DB_FIELDS.TRIPS.NAME}, ${DB_FIELDS.TRIPS.START_DATE}, 
        ${DB_FIELDS.TRIPS.END_DATE}, ${DB_FIELDS.TRIPS.CREATED_AT},
        ${DB_FIELDS.TRIPS.STATUS}, ${DB_FIELDS.TRIPS.DESTINATION_ID}, ${DB_FIELDS.TRIPS.DESTINATION_NAME},
        ${DB_FIELDS.TRIPS.COVER_IMAGE_URL}, ${DB_FIELDS.TRIPS.CREATED_BY}, ${DB_FIELDS.TRIPS.IS_PUBLIC},
        ${DB_FIELDS.TRIPS.PRIVACY_SETTING}, ${DB_FIELDS.TRIPS.DESCRIPTION}
      )
    `)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .order(DB_FIELDS.TRIPS.START_DATE, { foreignTable: DB_TABLES.TRIPS, ascending: false, nullsFirst: false })
    .order(DB_FIELDS.TRIPS.CREATED_AT, { foreignTable: DB_TABLES.TRIPS, ascending: false })
    // Cast the result data explicitly to match TripMemberRow[]
    .returns<TripMemberRow[]>()
  
  if (fetchErr) throw fetchErr
  
  // Ensure data is not null before returning
  const rows = data || [] 
  return { rows, userId }
}

function UserTripsList() {
  const router = useRouter()
  
  // Use SWR for data fetching
  const { data, error, isLoading } = useSWR('user-trips', fetchTrips, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    dedupingInterval: 10000, // 10 seconds
    errorRetryCount: 3
  })

  // Process and sort trips when data is available (Reverted inner changes)
  const trips = useMemo(() => {
    if (!data) return []
    
    const { rows, userId } = data
    
    // Filter out missing trips
    const valid = rows.filter((r: TripMemberRow): r is TripMemberRow & { trip: NonNullable<TripMemberRow['trip']> } => r.trip !== null)
    
    // Map to unified type
    const mappedTrips: TripWithMemberInfo[] = valid.map(({ role, joined_at, trip }) => ({
      ...trip,
      // Explicitly map fields ensuring null -> undefined conversion where needed
      id: trip.id, // Assuming ID is always present
      name: trip.name, // Assuming name is always present
      start_date: trip.start_date ?? undefined,
      end_date: trip.end_date ?? undefined,
      created_at: trip.created_at, // Assuming created_at is always present
      status: trip.status ?? undefined,
      destination_id: trip.destination_id ?? undefined,
      destination_name: trip.destination_name ?? undefined,
      cover_image_url: trip.cover_image_url ?? undefined,
      created_by: trip.created_by ?? userId,
      is_public: trip.is_public, // Assuming is_public is always present
      privacy_setting: trip.privacy_setting ?? undefined,
      description: trip.description ?? undefined, // Convert null to undefined
      // Member specific fields
      role: role ?? null,
      memberSince: joined_at ?? undefined, // Convert null to undefined
    }))
    
    // Sort: upcoming first, then past; use Date.parse for accuracy
    const today = new Date().setHours(0, 0, 0, 0)
    return mappedTrips.sort((a, b) => {
      const aDate = a.start_date ? new Date(a.start_date).getTime() : Infinity
      const bDate = b.start_date ? new Date(b.start_date).getTime() : Infinity
      const aUpcoming = aDate >= today
      const bUpcoming = bDate >= today
      
      // Sort by upcoming/past first
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
      
      // Both same side: nearest first if upcoming, most recent first if past
      return aUpcoming
        ? aDate - bDate
        : bDate - aDate
    })
  }, [data])

  // Redirect to login if not authenticated (Now after hooks)
  if (error?.message === 'Not authenticated') {
    router.replace(`/login?redirect=${encodeURIComponent(safeRedirect(PAGE_ROUTES.TRIPS))}`)
    // Return skeleton after hooks have run
    return <div className="grid grid-cols-1 gap-6">
      {[1,2,3].map(i => (
        <SkeletonTripCard key={i} />
      ))}
    </div>
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1,2,3].map(i => (
          <SkeletonTripCard key={i} />
        ))}
      </div>
    )
  }

  // Handle general fetch errors
  if (error) {
    return (
      <div className="my-8 text-center">
        <p className="text-destructive">Error loading your trips.</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      </div>
    )
  }

  // Handle case with no trips after loading and no error
  if (!isLoading && trips.length === 0) {
    return <EmptyTrips />
  }

  // Render the list of trips
  return (
    <div className="grid grid-cols-1 gap-6">
      {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
    </div>
  )
}

// Extracted skeleton component for better reusability
function SkeletonTripCard() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-40 w-full rounded-md" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  )
}

export default function TripsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">My Trips</h1>
      <div className="text-center mb-8">
        <Link href={PAGE_ROUTES.CREATE_TRIP}>
          <Button size="lg" className="rounded-full">
            <Plus className="h-5 w-5 mr-2" /> Create New Trip
          </Button>
        </Link>
      </div>
      <ClassErrorBoundary
        fallback={
          <div className="my-8 text-center">
            <p className="text-destructive">Failed to load trips.</p>
            <Button className="mt-4" onClick={() => { setRefreshKey(k => k+1) }}>
              Refresh
            </Button>
          </div>
        }
      >
        <UserTripsList key={refreshKey} />
      </ClassErrorBoundary>
    </div>
  )
}
