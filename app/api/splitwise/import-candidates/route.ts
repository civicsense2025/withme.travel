import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getGroup, type SplitwiseUser, SplitwiseError } from "@/lib/services/splitwise";

// Define the structure for an import candidate
interface ImportCandidate extends SplitwiseUser {
  status: "member" | "existing_user" | "new_user";
  profileId?: string; // Existing user ID in our system
}

// Get potential members to import from a linked Splitwise group
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tripId = url.searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the user has access to the trip (simplified check)
    const { data: tripMembership, error: tripError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !tripMembership) {
      return NextResponse.json(
        { error: "You don't have access to this trip" },
        { status: 403 }
      );
    }

    // Get the Splitwise group ID linked to this trip
    const { data: trip, error: tripDataError } = await supabase
      .from("trips")
      .select("splitwise_group_id")
      .eq("id", tripId)
      .single();

    if (tripDataError || !trip || !trip.splitwise_group_id) {
      return NextResponse.json(
        { error: "Trip not found or not linked to Splitwise" },
        { status: 404 }
      );
    }

    // Fetch the Splitwise group details (including members)
    const splitwiseGroupResponse = await getGroup(user.id, trip.splitwise_group_id);
    
    // Ensure the group and members exist before accessing
    if (!splitwiseGroupResponse || !splitwiseGroupResponse.group || !splitwiseGroupResponse.group.members) {
        console.error("Invalid response structure received from getGroup:", splitwiseGroupResponse);
        throw new Error("Failed to retrieve valid group data from Splitwise");
    }
    const splitwiseMembers = splitwiseGroupResponse.group.members;

    // Fetch current trip members
    const { data: currentTripMembers, error: currentMembersError } = await supabase
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", tripId);

    if (currentMembersError) {
      throw new Error("Failed to fetch current trip members");
    }
    const currentTripMemberIds = new Set(currentTripMembers.map(m => m.user_id));

    // Fetch existing user profiles based on emails from Splitwise members
    const splitwiseEmails = splitwiseMembers
      .map(m => m.email)
      .filter((email): email is string => !!email);
      
    let existingProfiles: Map<string, { id: string }> = new Map();
    if (splitwiseEmails.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("email", splitwiseEmails);
        
      if (profileError) {
        console.error("Error fetching profiles by email:", profileError);
        // Continue without matching emails if there's an error
      } else {
        existingProfiles = new Map(profiles.map(p => [p.email, { id: p.id }]));
      }
    }

    // Categorize Splitwise members
    const candidates: ImportCandidate[] = splitwiseMembers.map(swMember => {
      const existingProfile = swMember.email ? existingProfiles.get(swMember.email) : undefined;
      
      if (existingProfile && currentTripMemberIds.has(existingProfile.id)) {
        return { ...swMember, status: "member", profileId: existingProfile.id };
      } else if (existingProfile) {
        return { ...swMember, status: "existing_user", profileId: existingProfile.id };
      } else {
        return { ...swMember, status: "new_user" };
      }
    });

    return NextResponse.json({ candidates });

  } catch (error: any) {
    console.error("Error fetching Splitwise import candidates:", error);

    // Check if it's a specific Splitwise error
    if (error instanceof SplitwiseError) {
       // Use the status code and message from the specific error
       return NextResponse.json(
        { error: error.message || "Failed to communicate with Splitwise" },
        // Ensure a valid status code (default to 500 if missing, though SplitwiseError should have one)
        { status: error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500 }
      );
    }

    // Handle other unexpected errors (e.g., database errors before Splitwise call)
    return NextResponse.json(
      { error: error.message || "Failed to fetch Splitwise import candidates" },
      { status: 500 }
    );
  }
} 