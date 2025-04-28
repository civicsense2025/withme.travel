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
import { ErrorBoundary } from '@/components/error-boundary'
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
const fetchTrips = async () => {
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
  
  if (fetchErr) throw fetchErr
  
  const rows = data || []
  return { rows, userId }
}

function UserTripsList() {
  const router = useRouter()
  
  // Use SWR for data fetching with stale-while-revalidate strategy
  const { data, error, isLoading } = useSWR('user-trips', fetchTrips, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    dedupingInterval: 10000, // 10 seconds
    errorRetryCount: 3
  })

  // Redirect to login if not authenticated
  if (error?.message === 'Not authenticated') {
    router.replace(`/login?redirect=${encodeURIComponent(safeRedirect(PAGE_ROUTES.TRIPS))}`)
    return <div className="grid grid-cols-1 gap-6">
      {[1,2,3].map(i => (
        <SkeletonTripCard key={i} />
      ))}
    </div>
  }

  // Process and sort trips when data is available
  const trips = useMemo(() => {
    if (!data) return []
    
    const { rows, userId } = data
    
    // Filter out missing trips
    const valid = rows.filter((r: TripMemberRow) => r.trip !== null)
    
    // Map to unified type
    const mappedTrips: TripWithMemberInfo[] = valid.map(({ role, joined_at, trip }: TripMemberRow) => ({
      ...trip!,
      created_by: trip!.created_by ?? userId,
      role: role ?? null,
      memberSince: joined_at,
      description: trip!.description ?? null,
      destination_name: trip!.destination_name ?? null
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1,2,3].map(i => (
          <SkeletonTripCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-8 text-center">
        <p className="text-destructive">Error loading your trips.</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      </div>
    )
  }

  if (trips.length === 0) {
    return <EmptyTrips />
  }

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
      <ErrorBoundary
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
      </ErrorBoundary>
    </div>
  )
}
