import { createClient } from "@/utils/supabase/server"
import { TripHeader } from "@/components/trip-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItineraryTab } from "@/components/itinerary-tab"
import { MembersTab } from "@/components/members-tab"
import { MapTab } from "@/components/map-tab"
import { BudgetTab } from "@/components/budget-tab"
import { redirect } from "next/navigation"
import { CollaborativeNotes } from "@/components/collaborative-notes"
import { notFound } from "next/navigation"

export default async function TripPage({
  params,
}: {
  params: { id: string }
}) {
  // Validate the ID parameter first - make sure it's provided
  if (!params?.id) {
    notFound();
  }
  
  // Ensure the ID is a string and access it once
  const tripId = params.id as string;

  // Initialize Supabase client
  const supabase = createClient();

  // Use getUser instead of getSession for better security
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?redirect=" + encodeURIComponent(`/trips/${tripId}`));
  }

  // Fetch trip details
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*, destinations(*)")
    .eq("id", tripId)
    .single();

  if (tripError || !trip) {
    console.error("Trip not found or error:", tripError);
    redirect("/trips");
  }

  // Check if user is a member of this trip
  const { data: membership, error: membershipError } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership) {
    console.error("User is not a member of this trip:", membershipError);
    redirect("/trips");
  }

  // Fetch trip members
  const { data: members, error: membersError } = await supabase
    .from("trip_members")
    .select("*, profiles(id, name, avatar_url)")
    .eq("trip_id", tripId);

  if (membersError) {
    console.error("Error fetching trip members:", membersError);
    // Continue anyway, just log the error
  }

  // Check user role to determine edit permissions
  const canEdit = membership && ['owner', 'admin', 'editor'].includes(membership.role);

  return (
    <div className="container py-6">
      <TripHeader
        title={trip.name}
        destination={trip.destinations?.name || "Unknown"}
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
          <ItineraryTab tripId={tripId} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="map">
          <MapTab tripId={tripId} />
        </TabsContent>
        <TabsContent value="budget">
          <BudgetTab tripId={tripId} />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab 
            tripId={tripId} 
            canEdit={canEdit}
            userRole={membership.role}
          />
        </TabsContent>
        <TabsContent value="notes">
          <CollaborativeNotes 
            tripId={tripId} 
            readOnly={membership.role === "viewer"} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
