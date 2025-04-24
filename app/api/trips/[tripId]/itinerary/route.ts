import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { TRIP_ROLES, DB_TABLES, DB_FIELDS, VOTE_TYPES } from "@/utils/constants"
import { NextRequest } from "next/server"

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [
    TRIP_ROLES.ADMIN,
    TRIP_ROLES.EDITOR,
    TRIP_ROLES.VIEWER,
    TRIP_ROLES.CONTRIBUTOR,
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
        const isReadOnlyRequest = allowedRoles.length === 1 && allowedRoles[0] === TRIP_ROLES.VIEWER;
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

// Define interface for the votes query result
interface VoteWithProfile {
  itinerary_item_id: string; // Needed for mapping back
  user_id: string;
  vote_type: 'up' | 'down';
  // profiles can be null if the related profile doesn't exist
  profiles: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null; 
}

// Define a simpler interface for the fetched itinerary item structure
interface FetchedItineraryItem {
  id: string;
  day_number: number | null;
  position: number | null;
  // votes will be added later
  [key: string]: any; // Allow other properties
}

// GET /api/trips/[tripId]/itinerary - Fetch itinerary items for a trip
export async function GET(
  request: NextRequest,
  props: { params: { tripId: string } }
) {
  const { tripId } = props.params;
  if (!tripId) {
    return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
  }

  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const userId = user?.id;

    // --- Simplified Access Check (assuming previous check logic is okay) --- 
    // You might want to re-integrate the full checkTripAccess logic here
    const { data: memberCheck, error: memberError } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select('user_id')
        .eq('trip_id', tripId)
        .eq('user_id', userId ?? '')
        .maybeSingle();
        
    const { data: tripPublicCheck, error: publicError } = await supabase
        .from(DB_TABLES.TRIPS)
        .select('is_public, duration_days')
        .eq('id', tripId)
        .single();

    if (memberError || publicError) {
      console.error("Error checking access or trip details:", { memberError, publicError });
      return NextResponse.json({ error: "Failed to verify access." }, { status: 500 });
    }

    if (!memberCheck && !tripPublicCheck.is_public) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    // --- End Simplified Access Check ---
    
    const durationDays = tripPublicCheck?.duration_days ?? 1;

    // 1. Fetch basic itinerary items
    const { data: itemsData, error: itemsError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .select("*") // Select all basic fields
      .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
      .order(DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER, { ascending: true, nullsFirst: false })
      .order(DB_FIELDS.ITINERARY_ITEMS.POSITION, { ascending: true, nullsFirst: false });

    if (itemsError) {
      console.error("Error fetching itinerary items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
    
    const items = itemsData as FetchedItineraryItem[] || [];
    const itemIds = items.map(item => item.id);

    // 2. Fetch votes for these items separately
    let votesData: VoteWithProfile[] = [];
    if (itemIds.length > 0) {
      const { data: fetchedVotes, error: votesError } = await supabase
        .from(DB_TABLES.VOTES)
        .select(`
          itinerary_item_id, 
          user_id, 
          vote_type,
          profiles:user_id (
            id,
            name,
            avatar_url,
            username
          )
        `)
        .in(DB_FIELDS.VOTES.ITINERARY_ITEM_ID, itemIds);

      if (votesError) {
        console.error("Error fetching votes:", votesError);
        // Continue without votes, but maybe log it
      } else {
        // Cast more safely via unknown, ensuring it's an array before proceeding
        votesData = Array.isArray(fetchedVotes) ? (fetchedVotes as unknown as VoteWithProfile[]) : [];
      }
    }

    // 3. Combine data and group by day
    const itemsById: { [key: string]: FetchedItineraryItem & { votes: any } } = {};
    items.forEach(item => {
      itemsById[item.id] = { ...item, votes: null }; // Initialize votes as null
    });

    votesData.forEach(vote => {
      const itemId = vote.itinerary_item_id;
      if (itemsById[itemId]) {
        if (!itemsById[itemId].votes) {
          // Initialize the processed votes structure if this is the first vote for the item
          itemsById[itemId].votes = {
            up: 0,
            down: 0,
            upVoters: [],
            downVoters: [],
            userVote: null,
          };
        }
        // Process this specific vote
        if (vote.vote_type === VOTE_TYPES.UP) {
          itemsById[itemId].votes.up++;
          if (vote.profiles) itemsById[itemId].votes.upVoters.push(vote.profiles);
        } else if (vote.vote_type === VOTE_TYPES.DOWN) {
          itemsById[itemId].votes.down++;
          if (vote.profiles) itemsById[itemId].votes.downVoters.push(vote.profiles);
        }
        // Check if this vote belongs to the current user
        if (user && vote.user_id === userId) {
          itemsById[itemId].votes.userVote = vote.vote_type;
        }
      }
    });

    // Group the processed items by day
    const itemsByDay: { [key: number]: any[] } = {};
    Object.values(itemsById).forEach((processedItem) => {
      const day = processedItem.day_number ?? 0;
      if (!itemsByDay[day]) {
        itemsByDay[day] = [];
      }
      itemsByDay[day].push(processedItem);
    });

    return NextResponse.json(
      { 
        durationDays: durationDays,
        itemsByDay: itemsByDay 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Unexpected error fetching itinerary:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/trips/[tripId]/itinerary - Add a new itinerary item
export async function POST(
  request: NextRequest,
  props: { params: { tripId: string } }
) {
  // Extract tripId properly
  const { tripId } = props.params;

  if (!tripId) {
    return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
  }

  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user has permission to add items (e.g., admin, editor, contributor)
    const access = await checkTripAccess(supabase, tripId, user.id, [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
      TRIP_ROLES.CONTRIBUTOR,
    ])
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const newItemData = await request.json()

    // Validate required fields (example: title)
    if (!newItemData.title) {
      return NextResponse.json({ error: "Title is required for itinerary item." }, { status: 400 })
    }

    // Determine initial position (append to the end of the specified day)
    const dayNumber = newItemData.day_number ?? 1;
    // Use count: 'exact' to get the count directly
    const { count: itemCount, error: countError } = await supabase
        .from(DB_TABLES.ITINERARY_ITEMS)
        .select('', { count: 'exact', head: true }) // Select nothing, just get count
        .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
        .eq(DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER, dayNumber);
        
    if (countError) {
      console.error("Error counting existing items for position:", countError);
      // Proceed with position 0 or handle error appropriately
    }
    // Position is 0-indexed, so the count is the next available position
    const initialPosition = countError ? 0 : (itemCount ?? 0);

    // Add server-side context and defaults
    const itemToInsert = {
      ...newItemData, // Include potentially estimated_cost, currency, duration_minutes, day_number from request
      trip_id: tripId,
      created_by: user.id,
      day_number: dayNumber, // Ensure day_number is set
      position: initialPosition, // Set initial position
      status: newItemData.status || 'suggested', // Default status
    };

    // Insert the new item
    const { data: newItem, error: insertError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .insert(itemToInsert)
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting itinerary item:", insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    // Structure response similar to GET for consistency
    const processedItem = { ...newItem, votes: { up: 0, down: 0, userVote: null, upVoters: [], downVoters: [] } };

    return NextResponse.json({ item: processedItem }, { status: 201 })
  } catch (error: any) {
    console.error("Unexpected error creating itinerary item:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
