import { createApiClient } from "@/utils/supabase/server";
import type { Database } from "@/types/database.types";
import { NextResponse, NextRequest } from "next/server"
import { API_ROUTES } from "@/utils/constants"
import { DB_TABLES, DB_FIELDS, TRIP_ROLES } from "@/utils/constants"
import { z } from 'zod';
import { isBefore, parseISO, differenceInCalendarDays } from 'date-fns';
import { rateLimit } from '@/lib/rate-limit';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';
/**
 * Constants and configuration for API handlers
 */
// Maximum number of requests allowed per time window
const MAX_REQUESTS_PER_WINDOW = 100;
// Time window in seconds for rate limiting
const RATE_LIMIT_WINDOW_SEC = 60;

/**
 * Custom error class for API errors that can be easily serialized
 */
class TripApiError extends ApiError {
  constructor(message: string, status = 400, details?: any) {
    super(message, status, details);
  }
}

// Define privacy enum values explicitly for Zod validation
const privacySettingEnum = z.enum(['private', 'shared_with_link', 'public']);

type TripPrivacySetting = z.infer<typeof privacySettingEnum>;

// Schema for date validation with proper formatting
const dateSchema = z.string()
  .refine(
    (date) => {
      if (!date) return true;
      try {
        parseISO(date);
        return true;
      } catch {
        return false;
      }
    }, 
    { message: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)." }
  )
  .nullable()
  .optional();

// Schema for validating date ranges when both dates are present
const dateRangeRefinement = (data: { start_date?: string | null, end_date?: string | null }) => {
  if (data.start_date && data.end_date) {
    try {
      const start = parseISO(data.start_date);
      const end = parseISO(data.end_date);
      return !isBefore(end, start);
    } catch {
      return false;
    }
  }
  return true;
};

// Enhanced schema for trip updates with additional validations
const updateTripSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100).optional()
    .refine(name => !name || name.trim().length > 0, "Name cannot be empty"),
  start_date: dateSchema,
  end_date: dateSchema,
  destination_id: z.string().uuid("Invalid destination ID format").nullable().optional(),
  cover_image_url: z.string().url("Must be a valid URL").nullable().optional()
    .refine(url => !url || url.startsWith('https://'), "Cover image URL must use HTTPS"),
  budget: z.number().nonnegative("Budget must be a positive number or zero").optional().nullable(),
  cover_image_position_y: z.number().min(0, "Position must be between 0 and 100").max(100, "Position must be between 0 and 100").optional().nullable(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  privacy_setting: privacySettingEnum.optional(),
  playlist_url: z.union([
    z.string().url("Must be a valid playlist URL").refine(
      url => {
        // Restrict to known music streaming services
        const validDomains = ['spotify.com', 'music.apple.com', 'youtube.com', 'youtu.be', 'soundcloud.com', 'tidal.com'];
        try {
          const urlObj = new URL(url);
          return validDomains.some(domain => urlObj.hostname.includes(domain));
        } catch {
          return false;
        }
      },
      { message: "Playlist URL must be from a supported music platform" }
    ),
    z.string().max(0), // Empty string is valid 
    z.null()
  ]).optional(),
}).strict()
  // Add refinement for date range validation
  .refine(dateRangeRefinement, {
    message: "End date must be after start date",
    path: ["end_date"]
  });

// Type definitions mirroring TripPageClientProps structure needed
interface MemberProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface TripMemberFromSSR {
  id: string; // member id
  trip_id: string;
  user_id: string;
  role: typeof TRIP_ROLES[keyof typeof TRIP_ROLES];
  joined_at: string;
  profiles: MemberProfile | null;
}

interface DisplayItineraryItem { // Define based on expected fields
  id: string;
  trip_id: string;
  section_id: string | null;
  day_number: number | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  title: string | null;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  item_type: string | null;
  category: string | null;
  status: string | null;
  estimated_cost: number | null;
  currency: string | null;
  notes: string | null;
  source_url: string | null;
  confirmation_number: string | null;
  created_at: string;
  updated_at: string;
  // Add any other fields needed like votes, attachments etc.
}

interface ItinerarySection {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  items: DisplayItineraryItem[]; // Add items here
}

interface ManualDbExpense { // Define based on expected fields
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paid_by: string; 
  date: string; 
  created_at: string;
  updated_at?: string | null;
  source?: string | null;
}

interface Tag {
  id: string;
  name: string;
}

/**
 * Check if user has permission to access a trip
 * @param supabase Supabase client instance
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @param requiredRole Optional role requirement (if specific role is needed)
 * @returns Object with hasAccess flag and role if found
 */
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  userId: string,
  tripId: string,
  requiredRole?: typeof TRIP_ROLES[keyof typeof TRIP_ROLES][]
): Promise<{ hasAccess: boolean; role?: typeof TRIP_ROLES[keyof typeof TRIP_ROLES]; trip?: any; isPublic?: boolean }> {
  // First check if user is a member of the trip
  const { data: member, error: memberError } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .maybeSingle();

  if (memberError) {
    throw new TripApiError(`Error checking trip membership: ${memberError.message}`, 500);
  }

  const role = member?.role as typeof TRIP_ROLES[keyof typeof TRIP_ROLES] | undefined;

  // If user is a member and no specific role is required, or user has required role
  if (role && (!requiredRole || requiredRole.includes(role))) {
    return { hasAccess: true, role };
  }

  // If user is not a member or doesn't have required role, check if trip is public
  if (!requiredRole) {
    const { data: trip, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select('is_public, privacy_setting')
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError) {
      if (tripError.code === 'PGRST116') {
        return { hasAccess: false }; // Trip not found
      }
      throw new TripApiError(`Error checking trip privacy: ${tripError.message}`, 500);
    }

    const isPublic = trip.is_public || trip.privacy_setting === 'public' || trip.privacy_setting === 'shared_with_link';
    return { hasAccess: isPublic, isPublic, trip };
  }

  return { hasAccess: false };
}

/**
 * GET trip details with enhanced validation, rate limiting, and error handling
 */
export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  // Apply rate limiting
  // Get IP address from headers - request.ip is not reliable in all environments
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimitResult = await rateLimit.limit(`trips_api_${ip}`);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      formatErrorResponse("Rate limit exceeded. Try again later."),
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.reset),
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        }
      }
    );
  }

  // Validate trip ID
  const tripIdSchema = z.string().uuid("Invalid trip ID format");
  const { tripId } = await params;
  
  try {
    // Validate tripId parameter
    const validatedTripId = tripIdSchema.parse(tripId);
    
    // Set security headers
    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Cache-Control': 'no-store, max-age=0',
    });
    
    console.log(`API route called for trip ID: ${validatedTripId}`);
    const supabase = await createApiClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        formatErrorResponse(`Authentication error: ${authError?.message || 'Unknown auth error'}`),
        { status: 401, headers: responseHeaders }
      );
    }
    console.log(`User authenticated: ${user.id}`);

    // Check access to the trip using the helper function
    const accessCheck = await checkTripAccess(supabase, user.id, validatedTripId);

    if (!accessCheck.hasAccess) {
      // Check if trip exists but user lacks access vs trip not found
      const { data: tripExists } = await supabase.from(DB_TABLES.TRIPS).select('id').eq('id', validatedTripId).maybeSingle();
      const status = tripExists ? 403 : 404;
      const message = tripExists ? "You don't have access to this trip" : `Trip not found: ${validatedTripId}`;
      return NextResponse.json(
        // @ts-ignore - Suppressing potentially incorrect TS error due to union type inference
        formatErrorResponse(message, { tripId: validatedTripId, userId: user.id }),
        { status, headers: responseHeaders }
      );
    }

    // Fetch complete trip data with destination
    const { data: tripData, error: tripFetchError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(`
        *,
        destination: ${DB_FIELDS.TRIPS.DESTINATION_ID} ( * )
      `)
      .eq(DB_FIELDS.TRIPS.ID, validatedTripId)
      .single();

    if (tripFetchError) {
      console.error("Error fetching trip data:", tripFetchError);
      return NextResponse.json({ error: `Error fetching trip data: ${tripFetchError.message}` }, { status: 500 });
    }

    if (!tripData) {
      // Handle case where trip is not found after access check (should be rare)
      return NextResponse.json(
        formatErrorResponse(`Trip not found: ${validatedTripId}`),
        { status: 404, headers: responseHeaders }
      );
    }

    // Assign trip and destination
    const trip = tripData;
    const destination = trip.destination;

    // 2. Fetch All Members with Profiles
    const { data: membersData, error: membersError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(`
        *,
        profiles ( * )
      `)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId);

    if (membersError) {
      console.error("Error fetching trip members:", membersError);
      // Decide if this is critical - maybe return partial data?
      return NextResponse.json({ error: `Members fetch error: ${membersError.message}` }, { status: 500 });
    }
    const initialMembers = membersData as TripMemberFromSSR[] || [];

    // 3. Fetch Itinerary Sections and Items
    const { data: sectionsData, error: sectionsError } = await supabase
      .from(DB_TABLES.ITINERARY_SECTIONS)
      .select(`
        *,
        ${DB_TABLES.ITINERARY_ITEMS} ( * )
      `)
      .eq(DB_FIELDS.ITINERARY_SECTIONS.TRIP_ID, validatedTripId)
      .order(DB_FIELDS.ITINERARY_SECTIONS.POSITION, { ascending: true });
      // Items within sections don't have a stable order here, needs client-side sort or item query order

    if (sectionsError) {
      console.error("Error fetching itinerary sections:", sectionsError);
      return NextResponse.json({ error: `Sections fetch error: ${sectionsError.message}` }, { status: 500 });
    }
    const initialSections = (sectionsData || []).map(section => ({ 
      ...section, 
      items: section.itinerary_items as DisplayItineraryItem[] || [] 
    })) as ItinerarySection[];

    // 4. Fetch Unscheduled Items (items with null section_id)
    const { data: unscheduledItemsData, error: unscheduledItemsError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .select('*')
      .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, validatedTripId)
      .is(DB_FIELDS.ITINERARY_ITEMS.SECTION_ID, null)
      .order(DB_FIELDS.ITINERARY_ITEMS.CREATED_AT, { ascending: true }); // Or some other logical order

    if (unscheduledItemsError) {
      console.error("Error fetching unscheduled items:", unscheduledItemsError);
      return NextResponse.json({ error: `Unscheduled items fetch error: ${unscheduledItemsError.message}` }, { status: 500 });
    }
    const initialUnscheduledItems = unscheduledItemsData as DisplayItineraryItem[] || [];
    
    // 5. Fetch Tags with explicit type assertion on result
    const { data: tagsData, error: tagsError } = await supabase
      .from(DB_TABLES.TRIP_TAGS)
      .select(`
        ${DB_TABLES.TAGS} ( id, name ) 
      `)
      .eq(DB_FIELDS.TRIP_TAGS.TRIP_ID, validatedTripId)
      // Explicitly type the returned data structure
      .returns<{ tags: { id: string; name: string } | null }[]>();

    if (tagsError) {
      console.error("Error fetching tags:", tagsError);
      return NextResponse.json({ error: `Tags fetch error: ${tagsError.message}` }, { status: 500 });
    }
    // Now the mapping should be correctly typed
    const initialTags = (tagsData || []).map(t => t.tags).filter((t): t is Tag => t !== null); 

    // 6. Fetch Manual Expenses - Handle missing table gracefully
    let initialManualExpenses: ManualDbExpense[] = [];
    try {
      // Try to fetch from the expenses table (correct table name from constants)
      const { data: expensesData, error: expensesError } = await supabase
        .from(DB_TABLES.EXPENSES)
        .select('*')
        .eq('trip_id', validatedTripId)
        .order('date', { ascending: false });

      if (!expensesError) {
        initialManualExpenses = expensesData as ManualDbExpense[] || [];
      } else {
        console.error("Error fetching manual expenses:", expensesError);
        // Fall back to empty array, this is a non-critical error
      }
    } catch (error) {
      console.error("Exception when fetching expenses:", error);
      // Fall back to empty array
    }

    // 7. Calculate derived values
    const userRole = accessCheck.role;
    const canEdit = userRole === TRIP_ROLES.ADMIN || userRole === TRIP_ROLES.EDITOR;
    const isTripOver = trip.end_date ? isBefore(parseISO(trip.end_date), new Date()) : false;
    const tripDurationDays = trip.start_date && trip.end_date ? differenceInCalendarDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1 : null;

    console.log(`Trip ${validatedTripId} fully fetched successfully`);

    // Safely parse budget string to number
    let budgetNumber: number | null = null;
    if (trip.budget && typeof trip.budget === 'string') {
      const parsed = parseFloat(trip.budget);
      if (!isNaN(parsed)) {
        budgetNumber = parsed;
      }
    }

    // 8. Assemble response matching TripPageClientProps structure
    const responsePayload = {
      tripId: trip.id,
      tripName: trip.name,
      tripDescription: trip.description,
      startDate: trip.start_date,
      endDate: trip.end_date,
      tripDurationDays: tripDurationDays,
      coverImageUrl: trip.cover_image_url,
      destinationId: trip.destination_id,
      initialMembers: initialMembers,
      initialSections: initialSections,
      initialUnscheduledItems: initialUnscheduledItems,
      initialManualExpenses: initialManualExpenses,
      userRole: userRole,
      canEdit: canEdit,
      isTripOver: isTripOver,
      destinationLat: destination?.latitude,
      destinationLng: destination?.longitude,
      initialTripBudget: budgetNumber,
      initialTags: initialTags,
      slug: trip.slug, // Assuming slug exists on trip
      privacySetting: trip.privacy_setting as TripPrivacySetting | null, // Assuming privacy_setting exists
      playlistUrl: trip.playlist_url,
      // initialItineraryData seems redundant if we populate top-level props?
      // If needed, assemble it here from the fetched data.
    };

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error(`Unexpected error fetching trip ${tripId}:`, error);
    return NextResponse.json({
      error: `Unexpected server error: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      tripId: tripId
    }, { status: 500 });
  }
}

// --- PATCH Handler ---
export async function PATCH(request: NextRequest, { params }: { params: { tripId: string } }) { 
  const { tripId } = await params; 
  try {
    const supabase = await createApiClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: member, error: memberError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .in("role", [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR]) 
      .maybeSingle()

    if (memberError) {
      console.error("Error checking trip edit permissions:", memberError);
      return NextResponse.json({ error: "Error checking permissions" }, { status: 500 });
    }
    
    if (!member) {
      return NextResponse.json({ error: "You don't have permission to edit this trip" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = updateTripSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Trip update validation failed:", validationResult.error.issues);
      return NextResponse.json(
        { error: "Invalid input data", issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Prepare update object - REMOVE updated_at
    const finalDataToUpdate: Partial<Database['public']['Tables']['trips']['Update']> = {};

    // Map validated data, converting budget to string if present
    Object.keys(validatedData).forEach(key => {
      const typedKey = key as keyof typeof validatedData;
      if (validatedData[typedKey] !== undefined) {
        if (typedKey === 'budget' && typeof validatedData.budget === 'number') {
          (finalDataToUpdate as any)[typedKey] = String(validatedData.budget);
        } else {
          (finalDataToUpdate as any)[typedKey] = validatedData[typedKey];
        }
      }
    });

    // Remove undefined keys explicitly
    Object.keys(finalDataToUpdate).forEach(key => 
      (finalDataToUpdate as Record<string, any>)[key] === undefined && delete (finalDataToUpdate as Record<string, any>)[key]
    );

    // Assert the entire object as 'any' just before the update call (kept for safety)
    const { data, error: updateError } = await supabase
      .from(DB_TABLES.TRIPS)
      .update(finalDataToUpdate as any) 
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .select() // Select updated data
      .single();

    if (updateError) {
      console.error("Error updating trip:", updateError);
      return NextResponse.json({ error: `Failed to update trip: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ trip: data });

  } catch (error: any) {
     if (error instanceof SyntaxError) {
       return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
     }
     console.error("Unexpected error in PATCH trip:", error);
     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// --- DELETE Handler ---
export async function DELETE(request: Request, { params }: { params: { tripId: string } }) { 
  const { tripId } = await params; 
  try {
    const supabase = await createApiClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: member, error: memberError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .eq(DB_FIELDS.TRIP_MEMBERS.ROLE, TRIP_ROLES.ADMIN) 
      .maybeSingle()

    if (memberError) {
      console.error("Error checking trip delete permissions:", memberError);
      return NextResponse.json({ error: "Error checking permissions" }, { status: 500 });
    }

    if (!member) {
      return NextResponse.json({ error: "Only trip admins can delete a trip" }, { status: 403 });
    }

    // Perform deletion
    const { error: deleteError } = await supabase
      .from(DB_TABLES.TRIPS)
      .delete()
      .eq(DB_FIELDS.TRIPS.ID, tripId);

    if (deleteError) {
      console.error("Error deleting trip:", deleteError);
      return NextResponse.json({ error: `Failed to delete trip: ${deleteError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "Trip deleted successfully" });

  } catch (error: any) {
    console.error("Unexpected error in DELETE trip:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
} 