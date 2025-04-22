import { createClient } from "@/utils/supabase/server"
import { TripHeader } from "@/components/trip-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItineraryTab } from "@/components/itinerary-tab"
import { MembersTab } from "@/components/members-tab"
import { MapTab } from "@/components/map-tab"
import { BudgetTab } from "@/components/budget-tab"
import { redirect } from "next/navigation"
import { CollaborativeNotes } from "@/components/collaborative-notes"

export default async function TripPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch trip details
  const { data: trip } = await supabase.from("trips").select("*, destinations(*)").eq("id", params.id).single()

  if (!trip) {
    redirect("/trips")
  }

  // Check if user is a member of this trip
  const { data: membership } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (!membership) {
    redirect("/trips")
  }

  // Fetch trip members
  const { data: members } = await supabase
    .from("trip_members")
    .select("*, profiles(id, name, avatar_url)")
    .eq("trip_id", params.id)

  return (
    <div className="container py-6">
      <TripHeader
        title={trip.name}
        destination={trip.destinations.name}
        startDate={trip.start_date}
        endDate={trip.end_date}
        memberCount={members?.length || 0}
      />

      <Tabs defaultValue="itinerary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="itinerary">
          <ItineraryTab tripId={params.id} userRole={membership.role} />
        </TabsContent>
        <TabsContent value="map">
          <MapTab tripId={params.id} />
        </TabsContent>
        <TabsContent value="budget">
          <BudgetTab tripId={params.id} userRole={membership.role} />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab tripId={params.id} members={members || []} userRole={membership.role} />
        </TabsContent>
        <TabsContent value="notes">
          <CollaborativeNotes tripId={params.id} readOnly={membership.role === "viewer"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
