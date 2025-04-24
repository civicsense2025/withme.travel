import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DB_TABLES, DB_FIELDS, TRIP_ROLES, PAGE_ROUTES } from "@/utils/constants";
import { EditTripForm } from "@/app/trips/components/EditTripForm"; // Import the form
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
// Force dynamic rendering for this page since it uses auth
export const dynamic = 'force-dynamic';
export default async function EditTripPage({ params, }) {
    var _a, _b, _c, _d, _e;
    // Revert to awaiting params, keeping tripId
    const awaitedParams = await params;
    if (!(awaitedParams === null || awaitedParams === void 0 ? void 0 : awaitedParams.tripId)) { // Check tripId on awaited params
        notFound();
    }
    const tripId = awaitedParams.tripId; // Use tripId from awaited params
    const supabase = createClient();
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        // Redirect to login, preserving the original destination
        redirect(`/login?redirect=${encodeURIComponent(PAGE_ROUTES.EDIT_TRIP(tripId))}`);
    }
    // Fetch trip details specifically needed for the form
    const { data: tripData, error: tripError } = await supabase
        .from(DB_TABLES.TRIPS)
        .select(`
      id,
      name,
      start_date,
      end_date,
      destination_id,
      tags:trip_tags(tags(id, name)) // Added tags join
    `)
        .eq(DB_FIELDS.TRIPS.ID, tripId)
        .maybeSingle(); // Use maybeSingle in case trip doesn't exist
    const trip = tripData; // Add specific type for fetched data
    if (tripError) {
        console.error("Error fetching trip for edit:", tripError);
        // Consider showing an error message instead of just redirecting
        return (<div className="container py-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4"/>
          <AlertTitle>Error Fetching Trip</AlertTitle>
          <AlertDescription>{tripError.message}</AlertDescription>
        </Alert>
      </div>);
    }
    if (!trip) {
        notFound(); // Trip doesn't exist
    }
    // Check if user has permission to edit this trip (Admin or Editor)
    const { data: member, error: memberError } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
        .in("role", [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR])
        .maybeSingle();
    if (memberError) {
        console.error("Error checking edit permissions:", memberError);
        return (<div className="container py-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4"/>
          <AlertTitle>Error Checking Permissions</AlertTitle>
          <AlertDescription>{memberError.message}</AlertDescription>
        </Alert>
      </div>);
    }
    if (!member) {
        // User is not an admin/editor, show an error or redirect
        return (<div className="container py-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4"/>
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to edit this trip.</AlertDescription>
        </Alert>
      </div>);
        // Alternatively: redirect(PAGE_ROUTES.TRIP_DETAILS(tripId));
    }
    // User has permission, render the form
    return (<div className="container py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Trip</h1>
      <EditTripForm trip={{
            id: trip.id, // id should not be null if trip exists
            name: (_a = trip.name) !== null && _a !== void 0 ? _a : '', // Default to empty string if null
            start_date: (_b = trip.start_date) !== null && _b !== void 0 ? _b : '', // Default to empty string if null
            end_date: (_c = trip.end_date) !== null && _c !== void 0 ? _c : '', // Default to empty string if null
            destination_id: (_d = trip.destination_id) !== null && _d !== void 0 ? _d : '', // Default to empty string if null
            tags: ((_e = trip === null || trip === void 0 ? void 0 : trip.tags) === null || _e === void 0 ? void 0 : _e.map(t => { var _a; return (_a = t.tags) === null || _a === void 0 ? void 0 : _a.name; }).filter(Boolean)) || []
        }}/>
    </div>);
}
