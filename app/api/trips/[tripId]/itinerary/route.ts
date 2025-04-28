import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from "@/utils/constants/database"
import { NextRequest } from "next/server"
import { ItineraryItem, ItinerarySection } from "@/types/database.types"

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [
    DB_ENUMS.TRIP_ROLES.ADMIN,
    DB_ENUMS.TRIP_ROLES.EDITOR,
    DB_ENUMS.TRIP_ROLES.VIEWER,
    DB_ENUMS.TRIP_ROLES.CONTRIBUTOR,
  ]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking trip membership:", error);
    return { allowed: false, error: error.message, status: 500 };
  }

  if (!member) {
    // Allow access if the trip itself is public
    const { data: tripData, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(DB_FIELDS.TRIPS.IS_PUBLIC)
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError) {
      console.error("Error fetching trip details:", tripError);
      // Fallback to deny access if trip fetch fails
      return { allowed: false, error: "Could not verify trip access.", status: 500 };
    }

    if (tripData?.is_public) {
        // Allow read-only access for public trips
        // Check if the requested roles are only for viewing
        const isReadOnlyRequest = allowedRoles.length === 1 && allowedRoles[0] === DB_ENUMS.TRIP_ROLES.VIEWER;
        if(isReadOnlyRequest) {
            return { allowed: true };
        }
    } 
        
    // If not public or request is not read-only, deny access
    return {
        allowed: false,
        error: "Access Denied: You are not a member of this trip.",
        status: 403,
    };
  }

  if (!allowedRoles.includes(member.role)) {
    return {
      allowed: false,
      error: "Access Denied: You do not have sufficient permissions.",
      status: 403,
    };
  }

  return { allowed: true };
}

// Define structure for the response
interface ItinerarySectionWithItems extends ItinerarySection {
  items: DisplayItineraryItem[]; // Use the same processed item type as before
}

// Define ProcessedVotes and DisplayItineraryItem interfaces again (or import if centralized)
interface ProfileBasic {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface ProcessedVotes {
  up: number;
  down: number;
  upVoters: ProfileBasic[];
  downVoters: ProfileBasic[];
  userVote: 'up' | 'down' | null;
}
interface DisplayItineraryItem {
  id: string;
  trip_id: string;
  section_id?: string | null;
  title: string | null;
  type?: string | null;
  item_type?: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  address: string | null;
  place_id?: string | null;
  latitude: number | null;
  longitude: number | null;
  estimated_cost?: number | null;
  currency: string | null;
  notes?: string | null;
  created_at: string;
  created_by?: string | null;
  creatorProfile?: ProfileBasic | null;
  is_custom?: boolean | null;
  day_number?: number | null;
  category?: string | null; // Keep as string for now, align with DB
  status: 'pending' | 'approved' | 'rejected' | null; // ADDED STATUS
  position: number | null;
  duration_minutes?: number | null;
  cover_image_url?: string | null;
  votes: ProcessedVotes; // Keep the processed votes structure
  // Allow other properties fetched by '*' or explicit select
  [key: string]: any;
}

interface VoteWithProfile {
  itinerary_item_id: string;
  user_id: string;
  vote: 'up' | 'down'; // ALIGNED WITH DB
  profiles: ProfileBasic | null; // Use ProfileBasic type
}

// GET /api/trips/[tripId]/itinerary - Fetch itinerary structured by sections
export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = await params;
  if (!tripId) {
    return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
  }

  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const userId = user?.id; // Can be null if user is not logged in but viewing public trip

    // --- Access Check (Use destructured tripId) ---
    const { data: memberCheck, error: memberError } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select('user_id')
        .eq('trip_id', tripId) // Use variable
        .eq('user_id', userId ?? '')
        .maybeSingle();

    const { data: tripPublicCheck, error: publicError } = await supabase
        .from(DB_TABLES.TRIPS)
        .select('is_public')
        .eq('id', tripId) // Use variable
        .maybeSingle(); // Use maybeSingle as trip might not exist

    if (memberError || publicError) {
      console.error("Error checking access or trip details:", { memberError, publicError });
      return NextResponse.json({ error: "Failed to verify access." }, { status: 500 });
    }
     
    // If trip doesn't exist at all
    if (!tripPublicCheck && !memberCheck) {
         return NextResponse.json({ error: "Trip not found or access denied." }, { status: 404 });
    }

    // Deny access if user is not a member AND trip is not public
    if (!memberCheck && !tripPublicCheck?.is_public) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    // --- End Access Check ---

    // 1. Fetch Itinerary Sections (Use destructured tripId)
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('itinerary_sections')
      .select('*')
      .eq('trip_id', tripId) // Use variable
      .order('position', { ascending: true })
      .order('day_number', { ascending: true });

    if (sectionsError) {
      console.error("Error fetching itinerary sections:", sectionsError);
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }
    const sections = sectionsData || [];

    // 2. Fetch All Itinerary Items (Use destructured tripId) - SELECT specific columns including status
    const { data: itemsData, error: itemsError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .select(`
        id, trip_id, section_id, title, type, item_type, date, start_time, end_time,
        location, address, place_id, latitude, longitude, estimated_cost, currency, notes,
        created_at, created_by, is_custom, day_number, category, status, position,
        duration_minutes, 
        creatorProfile:profiles(id, name, avatar_url, username)
      `)
      .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId) // Use variable

    if (itemsError) {
      console.error("Error fetching itinerary items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
    const allItems = (itemsData as any[] | null) || []; // Cast to array for safety
    const itemIds = allItems.map(item => item.id);

    // 3. Fetch Votes for these items from the correct table, joining profiles
    let votesData: VoteWithProfile[] = [];
    if (itemIds.length > 0) {
      const { data: fetchedVotes, error: votesError } = await supabase
        .from(DB_TABLES.VOTES) // Use the correct table name for votes
        .select(`
          itinerary_item_id,\
          user_id,\
          vote \
        `) // Correct vote column name & simpler profile join syntax
        .in('itinerary_item_id', itemIds); // Correct column name

      if (votesError) {
        console.error("Error fetching votes:", votesError);
        // Continue without votes, maybe log error for debugging
      } else {
        votesData = (fetchedVotes as any[] | null)?.filter((v): v is VoteWithProfile => v !== null) || []; // Cast and filter nulls
      }
    }

    // 4. Process Votes and Map to Items
    const itemsById: { [itemId: string]: DisplayItineraryItem } = {};
    allItems.forEach(item => {
      itemsById[item.id] = {
        ...(item as any), // Cast item to any to avoid excessive type checking here
        creatorProfile: item.creatorProfile, // Keep the explicitly fetched creator profile
        status: item.status, // Ensure status is included
        votes: { // Initialize votes structure
          up: 0,
          down: 0,
          upVoters: [],
          downVoters: [],
          userVote: null,
        },
        userVote: null, // Initialize user vote
      };
    });

    votesData.forEach(vote => {
      const item = itemsById[vote.itinerary_item_id];
      if (item) {
        if (vote.vote === 'up') { // Use string literal
          item.votes.up++;
          // Add voter profile if it existed (it won't now, but keep logic structure)
          if (vote.profiles) item.votes.upVoters.push(vote.profiles);
        } else if (vote.vote === 'down') { // Use string literal
          item.votes.down++;
          // Add voter profile if it existed
          if (vote.profiles) item.votes.downVoters.push(vote.profiles);
        }
        if (userId && vote.user_id === userId) {
          item.votes.userVote = vote.vote;
        }
      }
    });

    // 5. Organize Items into Sections and Unscheduled
    const scheduledSectionsMap: { [sectionId: string]: ItinerarySectionWithItems } = {};
    sections.forEach(section => {
      scheduledSectionsMap[section.id] = {
        ...section,
        items: [], // Initialize items array
      };
    });

    const unscheduledItems: DisplayItineraryItem[] = [];

    Object.values(itemsById).forEach(item => {
      if (item.section_id && scheduledSectionsMap[item.section_id]) {
         scheduledSectionsMap[item.section_id].items.push(item);
      } else {
        // Assign to unscheduled if section_id is null or section not found
        unscheduledItems.push(item);
      }
    });
    
    // Sort items within each section (e.g., by position or start_time)
    Object.values(scheduledSectionsMap).forEach(section => {
        section.items.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
    });

    // Sort unscheduled items (e.g., by creation date or title)
    unscheduledItems.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

    const scheduledSectionsArray = Object.values(scheduledSectionsMap)
                                      .sort((a, b) => a.position - b.position); // Sort sections by position

    return NextResponse.json({
      sections: scheduledSectionsArray,
      unscheduled: unscheduledItems,
    });

  } catch (error) {
    console.error("Error fetching itinerary:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/trips/[tripId]/itinerary - Add a new itinerary item
export async function POST(
  request: NextRequest, // Use NextRequest to access searchParams
  { params }: { params: { tripId: string } }
) {
  const { tripId } = await params;
  if (!tripId) {
    return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to add items (Admi or Editor)
    const access = await checkTripAccess(supabase, tripId, user.id, [
      DB_ENUMS.TRIP_ROLES.ADMIN,
      DB_ENUMS.TRIP_ROLES.EDITOR,
    ]);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // Parse the request body for the new item data
    const newItemData = await request.json();

    // TODO: Add validation for newItemData here (e.g., using Zod)
    // For now, assume data is valid

    // Call Supabase RPC function to add the item
    // Assumes an RPC function `add_itinerary_item` exists
    // Alternatively, use a direct insert:
    // const { data, error } = await supabase.from(DB_TABLES.ITINERARY_ITEMS).insert({ ...newItemData, trip_id: tripId, created_by: user.id }).select().single();

    // We need to determine the next position for the item within its assigned day
    const targetDay = newItemData.day_number ?? null;
    let nextPosition = 0;

    if (targetDay !== null) {
      const { count, error: countError } = await supabase
        .from(DB_TABLES.ITINERARY_ITEMS)
        .select("", { count: "exact", head: true })
        .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
        .eq(DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER, targetDay);
      if (countError) {
        console.error("Error counting items in day:", countError);
        // Handle error or default position? Defaulting to 0
      } else {
        nextPosition = count ?? 0;
      }
    } else {
      // Handle unscheduled items - place at the end of unscheduled
      const { count, error: countError } = await supabase
        .from(DB_TABLES.ITINERARY_ITEMS)
        .select("", { count: "exact", head: true })
        .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
        .is(DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER, null);
       if (countError) {
        console.error("Error counting unscheduled items:", countError);
      } else {
        nextPosition = count ?? 0;
      } 
    }

    const itemToInsert = {
      ...newItemData,
      trip_id: tripId,
      created_by: user.id,
      position: nextPosition,
    };

    // Remove fields that might not be directly in the DB table (like creatorProfile)
    delete itemToInsert.creatorProfile;
    delete itemToInsert.votes;

    console.log("[API POST Itinerary] Inserting item:", itemToInsert); // DEBUG

    const { data: insertedItem, error: insertError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .insert(itemToInsert)
      .select(`
          *, 
          creatorProfile:profiles(id, name, avatar_url, username)
      `)
      .single();

    if (insertError) {
      console.error("Error inserting itinerary item:", insertError);
      return NextResponse.json(
        { error: `Failed to add item: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log("[API POST Itinerary] Insert successful:", insertedItem); // DEBUG
    
    // We need to fetch votes separately for the new item to match GET structure
    const finalItem = {
        ...insertedItem,
        votes: { up: 0, down: 0, upVoters: [], downVoters: [], userVote: null }
    };

    return NextResponse.json(finalItem, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error("Unexpected error in POST /itinerary:", error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}

// ... PUT handler may also need updating if it exists and uses props.params ...
// Assuming PUT handler follows similar pattern:
export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string, itemId: string } } 
) {
  // Re-adding await based on the specific Next.js error message
  const { tripId, itemId } = await params;
  // ... implementation needed ... 
   return NextResponse.json({ error: "PUT not implemented for new structure" }, { status: 501 });
}

// DELETE /api/trips/[tripId]/itinerary/[itemId] - Delete an itinerary item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; itemId: string } }
) {
  try {
    const { tripId } = await params;
    const itemId = params.itemId;

    if (!tripId || !itemId) {
      return NextResponse.json(
        { error: "Trip ID and Item ID are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check user's access to the trip
    const accessCheck = await checkTripAccess(supabase, tripId, user.id);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status || 403 }
      );
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .delete()
      .eq("id", itemId)
      .eq("trip_id", tripId);

    if (deleteError) {
      console.error("Error deleting item:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
