import { createApiClient } from "@/utils/supabase/server";
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { DB_TABLES, DB_FIELDS, TRIP_ROLES as DB_ENUMS } from "@/utils/constants"
import { NextRequest } from "next/server"
import { ItineraryItem, ItinerarySection } from "@/types/database.types"
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache'

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [
    DB_ENUMS.ADMIN,
    DB_ENUMS.EDITOR,
    DB_ENUMS.VIEWER,
    DB_ENUMS.CONTRIBUTOR,
  ]
) {
  const { data: membership, error } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trip access:', error);
    throw new ApiError('Failed to verify trip membership', 500);
  }

  if (!membership) {
    // Allow access if the trip itself is public
    const { data: tripData, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(DB_FIELDS.TRIPS.IS_PUBLIC)
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError) {
      console.error("Error fetching trip details:", tripError);
      // Fallback to deny access if trip fetch fails
      throw new ApiError("Could not verify trip access.", 500);
    }

    if (tripData?.is_public) {
        // Allow read-only access for public trips
        // Check if the requested roles are only for viewing
        const isReadOnlyRequest = allowedRoles.length === 1 && allowedRoles[0] === DB_ENUMS.VIEWER;
        if(isReadOnlyRequest) {
            return membership;
        }
    } 
        
    // If not public or request is not read-only, deny access
    throw new ApiError("Access Denied: You are not a member of this trip.", 403);
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new ApiError("Access Denied: You do not have sufficient permissions.", 403);
  }

  return membership;
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

// Validation schemas
const baseItineraryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  item_type: z.string().default('activity'),
  url: z.string().url().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  place_id: z.string().optional().nullable(), // Reference to a place
  destination_id: z.string().uuid().optional().nullable(), // Reference to a destination
  section_id: z.string().uuid().optional().nullable(), // Optional: Link to a specific section
  day_number: z.number().int().positive().optional().nullable(), // Optional: Link to a day number
  position: z.number().int().optional(), // For ordering within section/day
  data: z.record(z.any()).optional().nullable(), // For flexible custom data
});

const createItineraryItemSchema = baseItineraryItemSchema.omit({ position: true }); // Position is handled separately
const updateItineraryItemSchema = baseItineraryItemSchema.partial(); // All fields optional for update

const createItinerarySectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  description: z.string().optional().nullable(),
  day_number: z.number().int().positive().optional().nullable(),
  date: z.string().optional().nullable(), // ISO date string
  position: z.number().int().optional(),
});

const updateItinerarySectionSchema = createItinerarySectionSchema.partial();

// GET /api/trips/[tripId]/itinerary - Fetch itinerary structured by sections
export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = await params;
  if (!tripId) {
    return NextResponse.json(formatErrorResponse("Trip ID is required"), { status: 400 });
  }

  let supabase;
  try {
    supabase = await createApiClient();
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
      return NextResponse.json(formatErrorResponse("Failed to verify access."), { status: 500 });
    }
     
    // If trip doesn't exist at all
    if (!tripPublicCheck && !memberCheck) {
         return NextResponse.json(formatErrorResponse("Trip not found or access denied."), { status: 404 });
    }

    // Deny access if user is not a member AND trip is not public
    if (!memberCheck && !tripPublicCheck?.is_public) {
        return NextResponse.json(formatErrorResponse("Access Denied"), { status: 403 });
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
      return NextResponse.json(formatErrorResponse("Error fetching itinerary sections"), { status: 500 });
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
      return NextResponse.json(formatErrorResponse("Error fetching itinerary items"), { status: 500 });
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

  } catch (error: any) {
    console.error(`[ITINERARY API GET /${tripId}] Error:`, error);
    if (error instanceof ApiError) {
      return NextResponse.json(formatErrorResponse(error.message), { status: error.status });
    }
    return NextResponse.json(formatErrorResponse("An unexpected server error occurred"), { status: 500 });
  }
}

// POST /api/trips/[tripId]/itinerary - Add a new itinerary item
export async function POST(
  request: NextRequest, // Use NextRequest to access searchParams
  { params }: { params: { tripId: string } }
) {
  const { tripId } = await params;
  const cookieStore = cookies();

  try {
    const supabase = await createApiClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    await checkTripAccess(supabase, tripId, user.id, ['admin', 'editor', 'contributor']);

    const body = await request.json();
    const { type, ...payload } = body; // Expect 'item' or 'section' type

    if (type === 'item') {
      // Validate payload for itinerary item
      const validatedData = createItineraryItemSchema.parse(payload);

      // Determine the position for the new item
      const { data: maxPositionData, error: positionError } = await supabase
        .from(DB_TABLES.ITINERARY_ITEMS)
        .select(DB_FIELDS.ITINERARY_ITEMS.POSITION)
        .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
        .eq(DB_FIELDS.ITINERARY_ITEMS.SECTION_ID, validatedData.section_id ?? null) // Check position within the section
        .order(DB_FIELDS.ITINERARY_ITEMS.POSITION, { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to handle no items case

      if (positionError) {
        console.error("Error fetching max position:", positionError);
        throw new ApiError('Failed to determine item position', 500);
      }

      const nextPosition = (maxPositionData?.position ?? -1) + 1;

      // Insert new itinerary item
      const { data: newItem, error: insertError } = await supabase
        .from(DB_TABLES.ITINERARY_ITEMS)
        .insert([{ ...validatedData, trip_id: tripId, position: nextPosition }])
        .select('*')
        .single();

      if (insertError) {
        console.error("Error creating itinerary item:", insertError);
        throw new ApiError('Failed to create itinerary item', 500);
      }

      return NextResponse.json(newItem, { status: 201 });

    } else if (type === 'section') {
      // Validate payload for itinerary section
      const validatedData = createItinerarySectionSchema.parse(payload);

      // Determine the position for the new section
      const { data: maxPositionData, error: positionError } = await supabase
        .from(DB_TABLES.ITINERARY_SECTIONS)
        .select(DB_FIELDS.ITINERARY_SECTIONS.POSITION)
        .eq(DB_FIELDS.ITINERARY_SECTIONS.TRIP_ID, tripId)
        .order(DB_FIELDS.ITINERARY_SECTIONS.POSITION, { ascending: false })
        .limit(1)
        .maybeSingle();

      if (positionError) {
        console.error("Error fetching max section position:", positionError);
        throw new ApiError('Failed to determine section position', 500);
      }

      const nextPosition = (maxPositionData?.position ?? -1) + 1;

      // Insert new itinerary section
      const { data: newSection, error: insertError } = await supabase
        .from(DB_TABLES.ITINERARY_SECTIONS)
        .insert([{ ...validatedData, trip_id: tripId, position: nextPosition }])
        .select('*')
        .single();

      if (insertError) {
        console.error("Error creating itinerary section:", insertError);
        throw new ApiError('Failed to create itinerary section', 500);
      }

      return NextResponse.json(newSection, { status: 201 });

    } else {
      return NextResponse.json(formatErrorResponse("Invalid type specified. Must be 'item' or 'section'"), { status: 400 });
    }

  } catch (error: any) {
    console.error(`[ITINERARY API POST /${tripId}] Error:`, error);
    if (error instanceof z.ZodError) {
      // @ts-ignore - Suppressing erroneous TS error about details type
      return NextResponse.json(formatErrorResponse("Invalid input data", error.issues), { status: 400 });
    } else if (error instanceof ApiError) {
      return NextResponse.json(formatErrorResponse(error.message), { status: error.status });
    }
     // Handle potential JSON parsing errors
     if (error instanceof SyntaxError) {
      console.error("Invalid JSON:", error);
      return NextResponse.json(formatErrorResponse("Invalid JSON format in request body"), { status: 400 });
    }
    return NextResponse.json(formatErrorResponse("An unexpected server error occurred"), { status: 500 });
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

    const supabase = await createApiClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check user's access to the trip
    await checkTripAccess(supabase, tripId, user.id);

    // Delete the item
    const { error: deleteError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .delete()
      .eq("id", itemId)
      .eq("trip_id", tripId);

    if (deleteError) {
      console.error("Error deleting item:", deleteError);
      throw new ApiError('Failed to delete itinerary item', 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete handler:", error);
    return NextResponse.json(formatErrorResponse("Internal server error"), { status: 500 });
  }
}
