import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DB_TABLES, TRIP_ROLES, DB_FIELDS, VOTE_TYPES } from "@/utils/constants";

// Helper function to check user membership and role (can be reused or imported)
async function checkTripAccess(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [
    TRIP_ROLES.ADMIN,
    TRIP_ROLES.EDITOR,
    TRIP_ROLES.VIEWER,
    TRIP_ROLES.CONTRIBUTOR
  ]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking trip membership:", error);
    return { allowed: false, error: error.message, status: 500 };
  }

  if (!member) {
    return {
      allowed: false,
      error: "Access Denied: You are not a member of this trip.",
      status: 403,
    };
  }

  if (!allowedRoles.includes(member.role)) {
    return {
      allowed: false,
      error: "Access Denied: You do not have sufficient permissions for this action.",
      status: 403,
    };
  }

  return { allowed: true };
}

// Helper to check trip membership (can be extracted to a shared util later)
async function checkTripMembership(supabase: ReturnType<typeof createClient>, tripId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select('user_id')
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
        .maybeSingle();
    
    if (error) {
        console.error("Error checking trip membership:", error);
        return false;
    }
    return !!data; // Return true if a membership record exists
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string; itemId: string } }
) {
  const { tripId, itemId } = params;
  if (!tripId || !itemId) {
    return NextResponse.json({ error: "Trip ID and Item ID are required" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  // Check if user is part of the trip
  const isMember = await checkTripMembership(supabase, tripId, userId);
  if (!isMember) {
      return NextResponse.json({ error: "Forbidden: User is not a member of this trip." }, { status: 403 });
  }

  let voteType: 'up' | 'down';
  try {
    const body = await request.json();
    if (body.voteType !== VOTE_TYPES.UP && body.voteType !== VOTE_TYPES.DOWN) {
        throw new Error("Invalid vote type");
    }
    voteType = body.voteType;
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or vote type" }, { status: 400 });
  }

  try {
    // Upsert the vote: If the user already voted on this item, update the vote. Otherwise, insert a new vote.
    const { error: upsertError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEM_VOTES)
      .upsert(
        {
          itinerary_item_id: itemId,
          user_id: userId,
          vote: voteType, // Use the correct 'vote' column name from schema
          // created_at is handled by default, updated_at by trigger or default
        },
        {
          onConflict: 'itinerary_item_id, user_id', // Specify conflict target columns
        }
      );

    if (upsertError) {
      console.error("Error upserting vote:", upsertError);
      throw upsertError;
    }

    // Optional: Recalculate and return new vote counts if needed by the client immediately,
    // otherwise the client can refetch or update optimistically.
    // For now, just return success.
    return NextResponse.json({ success: true, message: "Vote recorded" }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing vote:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
} 