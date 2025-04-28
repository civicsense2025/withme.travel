import { createApiClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';

/**
 * Delete a trip and its associated data
 * Only accessible by admin users
 * @param request The HTTP request
 * @param params The route parameters containing trip ID
 * @returns A JSON response indicating success or failure
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createApiClient()
  const id = params.id

  try {
    // First, verify this user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabase
      .from(DB_TABLES.PROFILES)
      .select(DB_FIELDS.PROFILES.IS_ADMIN)
      .eq(DB_FIELDS.PROFILES.ID, user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use the supabase client for operations
    // Note: In a real app, you would likely have a more robust method
    // for obtaining admin privileges, possibly using service roles

    // First delete trip_members to avoid foreign key constraints
    const { error: memberError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .delete()
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, id);

    if (memberError) {
      console.error("Error deleting trip members:", memberError);
      return NextResponse.json({
        error: "Failed to delete trip members",
        details: memberError.message
      }, { status: 500 });
    }

    // Fetch the trip with all necessary relations
    const { data: trip, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(`
        *,
        ${DB_TABLES.TRIP_MEMBERS} (
          id,
          ${DB_FIELDS.TRIP_MEMBERS.USER_ID},
          ${DB_FIELDS.TRIP_MEMBERS.ROLE},
          ${DB_FIELDS.TRIP_MEMBERS.JOINED_AT},
          ${DB_TABLES.PROFILES} (
            id,
            ${DB_FIELDS.PROFILES.NAME},
            ${DB_FIELDS.PROFILES.EMAIL},
            ${DB_FIELDS.PROFILES.AVATAR_URL}
          )
        ),
        destinations (
          id,
          name,
          city,
          country,
          region
        )
      `)
      .eq(DB_FIELDS.TRIPS.ID, id)
      .single();

    // Now delete the trip
    const { error: tripDeleteError } = await supabase
      .from(DB_TABLES.TRIPS)
      .delete()
      .eq(DB_FIELDS.TRIPS.ID, id);

    if (tripDeleteError) {
      console.error("Error deleting trip:", tripDeleteError);
      return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Trip deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to delete trip",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Update a trip's details
 * Only accessible by admin users
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createApiClient();
  const id = params.id;

  try {
    // Verify this user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabase
      .from(DB_TABLES.PROFILES)
      .select(DB_FIELDS.PROFILES.IS_ADMIN)
      .eq(DB_FIELDS.PROFILES.ID, user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse the request body
    const body = await request.json();
    
    // Update the trip
    const { data, error } = await supabase
      .from(DB_TABLES.TRIPS)
      .update({
        [DB_FIELDS.TRIPS.NAME]: body.name,
        [DB_FIELDS.TRIPS.START_DATE]: body.start_date,
        [DB_FIELDS.TRIPS.END_DATE]: body.end_date,
        [DB_FIELDS.TRIPS.IS_PUBLIC]: body.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq(DB_FIELDS.TRIPS.ID, id)
      .select(`
        id, 
        ${DB_FIELDS.TRIPS.NAME}, 
        ${DB_FIELDS.TRIPS.DESTINATION_ID},
        destination_name,
        ${DB_FIELDS.TRIPS.START_DATE}, 
        ${DB_FIELDS.TRIPS.END_DATE}, 
        ${DB_FIELDS.TRIPS.CREATED_BY},
        created_at,
        updated_at,
        ${DB_FIELDS.TRIPS.IS_PUBLIC},
        slug
      `)
      .single();

    if (error) {
      throw error;
    }

    // Fetch creator information if needed
    if (data) {
      const { data: creatorProfile, error: profileError } = await supabase
        .from(DB_TABLES.PROFILES)
        .select(`${DB_FIELDS.PROFILES.ID}, ${DB_FIELDS.PROFILES.EMAIL}, ${DB_FIELDS.PROFILES.NAME}`)
        .eq(DB_FIELDS.PROFILES.ID, data.created_by)
        .single();

      if (!profileError && creatorProfile) {
        (data as any).creator = creatorProfile;
      }
    }

    return NextResponse.json({ 
      success: true,
      trip: data 
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to update trip",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
