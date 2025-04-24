import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DB_TABLES, DB_FIELDS, TRIP_ROLES, PAGE_ROUTES } from "@/utils/constants";
import { EditTripForm } from "@/app/trips/components/EditTripForm"; // Corrected import path
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Metadata } from "next";

// Force dynamic rendering for this page since it uses auth
export const dynamic = 'force-dynamic';

export default async function EditTripPage({
  params,
}: {
  params: { tripId: string } 
}) {
  // Revert to awaiting params, keeping tripId
  const awaitedParams = await params; 
  if (!awaitedParams?.tripId) { // Check tripId on awaited params
    notFound();
  }
  const tripId = awaitedParams.tripId as string; // Use tripId from awaited params

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

  const trip = tripData as ({ 
      id: string; 
      name: string | null; 
      start_date: string | null; 
      end_date: string | null; 
      destination_id: string | null; 
      tags: { tags: { id: string; name: string; } | null }[] | null 
  }) | null; // Add specific type for fetched data

  if (tripError) {
    console.error("Error fetching trip for edit:", tripError);
    // Consider showing an error message instead of just redirecting
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Trip</AlertTitle>
          <AlertDescription>{tripError.message}</AlertDescription>
        </Alert>
      </div>
    );
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
     return (
      <div className="container py-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Checking Permissions</AlertTitle>
          <AlertDescription>{memberError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!member) {
    // User is not an admin/editor, show an error or redirect
     return (
      <div className="container py-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to edit this trip.</AlertDescription>
        </Alert>
      </div>
    );
    // Alternatively: redirect(PAGE_ROUTES.TRIP_DETAILS(tripId));
  }

  // User has permission, render the form
  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Trip</h1>
      <EditTripForm 
        trip={{
          id: trip.id, // id should not be null if trip exists
          name: trip.name ?? '', // Default to empty string if null
          start_date: trip.start_date ?? '', // Default to empty string if null
          end_date: trip.end_date ?? '', // Default to empty string if null
          destination_id: trip.destination_id ?? '', // Default to empty string if null
          tags: trip?.tags?.map(t => t.tags?.name).filter(Boolean) as string[] || [] 
        }}
      />
    </div>
  );
} 