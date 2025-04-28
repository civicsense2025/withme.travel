import { createClient } from "@/utils/supabase/server";
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from "@/utils/constants/database";
import { PAGE_ROUTES } from "@/utils/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the client component with no SSR
const EditTripFormClient = dynamic(
  () => import("@/app/trips/components/EditTripForm").then(mod => ({ default: mod.EditTripForm })),
  { ssr: false }
);

// Force dynamic rendering for this page since it uses auth
export const dynamicParams = true;

// Define a type specifically for the data structure returned by this page's query
interface FetchedTripData {
  id: string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  cover_image_url: string | null;
  // Use imported enum type or literal union type for privacy_setting
  privacy_setting: 'private' | 'shared_with_link' | 'public' | null; 
  // Type for the joined destination data (since it's a single record)
  destinations: {
    id: string;
    name: string | null; 
    address: string | null;
    city: string | null;
    country: string | null;
  } | null;
  // Type for the joined tags data
  trip_tags: Array<{
    tags: {
      id: string;
      name: string;
    } | null;
  }> | null;
}

// Define the expected shape of the form data
interface TripFormData {
  name: string;
  privacy_setting: 'private' | 'shared_with_link' | 'public';
  cover_image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  destination_id?: string | null;
  tags?: string[] | null;
}

export default async function EditTripPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient();

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect(PAGE_ROUTES.LOGIN);
  }

  // Check if user has permission to edit this trip
  const { data: tripMember, error: tripMemberError } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, params.tripId)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, session.user.id)
    .single();

  if (tripMemberError || !tripMember) {
    console.error("Error fetching trip member or user is not a member:", tripMemberError);
    notFound();
  }

  // Check if user has editor/organizer role
  if (![DB_ENUMS.TRIP_ROLES.EDITOR, DB_ENUMS.TRIP_ROLES.ADMIN].includes(tripMember.role)) {
    redirect(`/trips/${params.tripId}`);
  }

  // Fetch trip data with destination and tags
  const { data: trip, error: tripError } = await supabase
    .from(DB_TABLES.TRIPS)
    .select(`
      id, name, start_date, end_date, destination_id, cover_image_url, privacy_setting,
      destinations:destination_id (
        id, name, address, city, country
      ),
      trip_tags (
        tags (
          id, name
        )
      )
    `)
    .eq(DB_FIELDS.COMMON.ID, params.tripId)
    .single() as { data: FetchedTripData | null, error: any };

  if (tripError || !trip) {
    console.error("Error fetching trip:", tripError);
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load trip details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Extract tag IDs from the trip_tags join table
  const tagIds = (trip.trip_tags || [])
    .filter(tt => tt.tags !== null)
    .map(tt => tt.tags?.id)
    .filter(Boolean) as string[];

  // Prepare the trip data for the form
  const formattedTrip = {
    id: trip.id,
    name: trip.name || "Untitled Trip", // Provide a default name if null
    start_date: trip.start_date || "",
    end_date: trip.end_date || "",
    destination_id: trip.destination_id,
    cover_image_url: trip.cover_image_url,
    privacy_setting: trip.privacy_setting || "private", // Provide a default privacy setting if null
    tags: tagIds,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>
      <EditTripFormClient 
        trip={formattedTrip} 
        initialDestinationName={trip.destinations?.name || undefined}
        onSave={async (data: TripFormData) => {
          // This would typically be implemented in a client component
          // Placeholder for the required prop
          console.log("Save data:", data);
          return Promise.resolve();
        }}
        onClose={() => {
          // This would typically be implemented in a client component
          // Placeholder for the required prop
          console.log("Close form");
        }}
      />
    </div>
  );
} 