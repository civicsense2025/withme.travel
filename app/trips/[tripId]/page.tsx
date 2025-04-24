import { createClient } from "@/utils/supabase/server"
import { TripHeader } from "@/components/trip-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersTab, MemberProfile, TripMemberFromSSR } from "@/components/members-tab"
// import { MapTab } from "@/components/map-tab" // Commented out missing import
import { BudgetTab } from "@/components/budget-tab"
import { redirect, notFound } from "next/navigation"
import { CollaborativeNotes } from "@/components/collaborative-notes"
import { DB_TABLES, DB_FIELDS, TRIP_ROLES, PAGE_ROUTES, VOTE_TYPES, API_ROUTES } from "@/utils/constants"
import { ItineraryBuilder } from "@/components/itinerary/itinerary-builder"
import { ItineraryDisplay } from "@/components/itinerary/itinerary-display"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil } from "lucide-react"
import { ItineraryItem } from "@/types/itinerary"
import { Profile } from "@/types/profiles"
import { Trip } from "@/types/trip"
import { TripRole } from "@/utils/constants"
import { TripPageClient } from "./trip-page-client"
import { SplitwiseExpense } from "@/components/splitwise-expenses"
import { cookies } from 'next/headers'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
// Import type for manual expenses if defined elsewhere, or define locally
// import { type Expense as ManualDbExpense } from '@/types/expense'; // Module not found

// Define Json type locally (based on Supabase common definition)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Define ManualDbExpense type locally based on expected fields
interface ManualDbExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paid_by: string; // User ID
  date: string; // ISO string
  created_at: string;
  updated_at?: string | null;
  // Add other fields if selected/needed, e.g., source
  source?: string | null; 
}

// Add this line to force dynamic rendering
export const dynamic = 'force-dynamic'

// Type definitions
export interface ProcessedVotes {
  up: number;
  down: number;
  upVoters: Profile[];
  downVoters: Profile[];
  userVote: 'up' | 'down' | null;
}
export interface DisplayItineraryItem extends Omit<ItineraryItem, 'votes'> {
  votes: ProcessedVotes;
}

// Define the structure for votes with profile data
interface VoteWithProfile {
  user_id: string;
  vote_type: 'up' | 'down';
  profiles: Profile | null; // Assuming 'profiles' is the alias for the joined profile
}

// Define the structure coming back from the specific join query
interface TripWithJoinedTags extends Omit<Trip, 'tags' | 'destinations'> {
  joined_tags: { tags: { id: string, name: string } }[] | null;
  destinations: Array<{
      id: string;
      city: string | null;
      country: string | null;
  }> | null;
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  cover_image_url: string | null;
  splitwise_group_id?: number | null; 
  created_at: string;
  updated_at: string;
  status: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  is_public: boolean;
  destination_id: string | null; 
  budget: {
    total: number;
    currency: string;
    categories: {
      accommodation: number;
      transportation: number;
      activities: number;
      food: number;
      shopping: number;
      other: number;
    };
  } | null;
  notes: string | null;
  likes_count: number;
  comments_count: number;
  shared_url?: string; 
  public_slug?: string | null;
}

// Helper function to fetch itinerary data (accepts userId)
// Added userId parameter, improved type safety and error handling
async function getItineraryItems(tripId: string, userId: string): Promise<DisplayItineraryItem[]> {
  const supabase = createClient();
  // Removed internal getUser call

  // Define the expected structure of items fetched from the DB, including votes
  type ItineraryItemWithVotes = ItineraryItem & {
    votes: VoteWithProfile[] | null;
  };

  // Fetch itinerary items with votes and voter profiles
  // Removed generic from .select() for now
  const { data, error: fetchError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .select(` 
        *,
        ${DB_TABLES.VOTES} (
          ${DB_FIELDS.VOTES.USER_ID},
          ${DB_FIELDS.VOTES.VOTE_TYPE},
          ${DB_TABLES.PROFILES}:${DB_FIELDS.VOTES.USER_ID} (
            ${DB_FIELDS.PROFILES.ID},
            ${DB_FIELDS.PROFILES.NAME},
            ${DB_FIELDS.PROFILES.AVATAR_URL},
            ${DB_FIELDS.PROFILES.USERNAME}
          )
        )
      `) // Ensure template literal is closed
      .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
      .order("date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });

  if (fetchError) {
    console.error("Error fetching itinerary items for page:", fetchError);
    // Re-throw the error instead of returning empty array
    throw fetchError;
  }

  // Explicitly type items after fetch
  const items = data as ItineraryItemWithVotes[] | null;

  // Process items with improved type safety
  const processedItems = items?.map((item: ItineraryItemWithVotes): DisplayItineraryItem => { // Added type for item
    const currentVotes = item.votes || [];
    // Added type annotations for v
    const upVotes = currentVotes.filter((v: VoteWithProfile) => v.vote_type === VOTE_TYPES.UP);
    const downVotes = currentVotes.filter((v: VoteWithProfile) => v.vote_type === VOTE_TYPES.DOWN);
    // Use provided userId
    const userVote = currentVotes.find((v: VoteWithProfile) => v.profiles?.id === userId)?.vote_type || null;

    // Explicitly type the return object to match DisplayItineraryItem structure
    const displayItem: DisplayItineraryItem = {
      ...item, // Spread the original item properties
      votes: { // Construct the ProcessedVotes object
        up: upVotes.length,
        down: downVotes.length,
        // Ensure profiles exist before mapping & add type annotation for v
        // Simplified filter check and added type for p
        upVoters: upVotes.map((v: VoteWithProfile) => v.profiles).filter((p: Profile | null): p is Profile => p !== null),
        downVoters: downVotes.map((v: VoteWithProfile) => v.profiles).filter((p: Profile | null): p is Profile => p !== null),
        userVote: userVote,
      }
    };
    return displayItem;
  }) || [];

  return processedItems; // Already correctly typed
}

// --- Fetch Splitwise Expenses Server-Side --- 
// Use ReturnType<typeof cookies> for the type
async function getSplitwiseDataServer(tripId: string): Promise<{expenses: SplitwiseExpense[], groupName: string | null}> {
  // Get cookies instance
  // Await cookies() as per Next.js recommendation for dynamic usage
  const cookieStore = await cookies(); 

  // Construct URL correctly for server-side fetching in Next.js
  // Using an absolute URL with the internal Next.js API routes
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000';
  const url = `${protocol}://${host}/api/splitwise/expenses?tripId=${tripId}`;
  
  console.log("Fetching splitwise data from URL:", url);

  try {
    const response = await fetch(url, {
        headers: {
          // Forward cookies from the server component to the API route
          // Use cookieStore.getAll() and format manually for robustness
          Cookie: cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
        },
        cache: 'no-store', // Ensure fresh data
    });

    // Handle non-OK responses first
    if (!response.ok) {
        // Specifically handle 401 Unauthorized
        if (response.status === 401) {
            console.error(`Splitwise API route returned 401 for trip ${tripId}: Authentication required.`);
            // Don't throw, just return default. The client can decide how to handle lack of connection.
            return { expenses: [], groupName: null }; 
        }
        // Specifically handle 400 Bad Request (likely not linked)
        else if (response.status === 400) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) { 
                // Ignore JSON parsing error if body is empty or not JSON
                console.warn("Could not parse JSON from 400 response in getSplitwiseDataServer");
            }
            // Log the specific reason if available, otherwise just note the 400
            console.warn(
                `Splitwise API route returned 400 for trip ${tripId}:`,
                (errorData as any)?.error || '(No specific error message)'
            );
            return { expenses: [], groupName: null }; // Return default for 400 errors
        } 
        // Handle other non-OK statuses
        else {
            const errorData = await response.json().catch(() => ({}));
            console.error(
                `Error fetching Splitwise data server-side (${response.status}):`,
                 errorData
            );
            return { expenses: [], groupName: null }; 
        }
    }

    // Process successful response
    const data = await response.json();
    return { 
        expenses: data.expenses || [], 
        groupName: data.groupName || null 
    };

  } catch (error) {
    // Catch fetch errors or other unexpected issues
    console.error("Catch block error in getSplitwiseDataServer fetch:", error);
    return { expenses: [], groupName: null }; // Return default object
  }
}

// Updated TripPage component
export default async function TripPage(props: {
  params: { tripId: string };
}) {
  // Extract the tripId properly
  const { tripId } = props.params;

  // Check for tripId existence before proceeding
  if (!tripId) {
    notFound();
  }

  const cookieStore = cookies(); 
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/login?redirect=${encodeURIComponent(PAGE_ROUTES.TRIP_DETAILS(tripId))}`);
  }

  // --- Step 1: Fetch Essential Trip Data First ---
  let trip: TripWithJoinedTags | null = null;
  let destinationId: string | null = null;
  try {
    const { data: tripData, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        created_at, 
        updated_at,
        status,
        is_public,
        destination_id, 
        budget,
        notes,
        likes_count, 
        comments_count,
        shared_url,
        public_slug,
        created_by, 
        cover_image_url,
        destinations ( id, city, country ),
        joined_tags:trip_tags(tags(id, name)), 
        splitwise_group_id 
      `)
      .eq(DB_FIELDS.TRIPS.ID, tripId) 
      // Use maybeSingle() to handle RLS/not found without throwing
      .maybeSingle(); 

    // Handle potential database errors first
    if (tripError) {
      console.error("Error fetching trip data (Supabase Error):", {
        message: tripError.message,
        code: tripError.code,
        details: tripError.details,
        hint: tripError.hint,
      });
      // Decide if redirect is appropriate for all DB errors, or show error message
      redirect(PAGE_ROUTES.TRIPS);
    }

    // Handle case where trip is not found or user lacks access (RLS)
    if (!tripData) {
      console.log(`Trip not found or access denied for tripId: ${tripId}`);
      // Use notFound() for a 404 page instead of redirecting to /trips
      notFound(); 
      // Or, keep redirect if preferred: redirect(PAGE_ROUTES.TRIPS);
    }

    // If we reach here, tripData is valid
    trip = tripData as unknown as TripWithJoinedTags;
    destinationId = trip.destinations?.[0]?.id ?? null;

  } catch (error) {
      // Catch unexpected errors (e.g., network issues, other code errors)
      console.error("Unexpected error during initial trip data fetch:", error);
      // Consider a more generic error page or redirect
      redirect(PAGE_ROUTES.TRIPS); 
  }
  // --- End Step 1 ---

  // --- Step 2: Fetch Additional Data (can potentially still use Promise.allSettled here) ---
  let membershipResult: { data: { role: string } | null; error: any } | null = null;
  let membersResult: { data: TripMemberFromSSR[] | null; error: any } | null = null;
  let itineraryItemsResult: DisplayItineraryItem[] = []; 
  let splitwiseDataResult: { expenses: SplitwiseExpense[]; groupName: string | null } = { expenses: [], groupName: null };
  // Add state for manual expenses
  let manualExpensesResult: ManualDbExpense[] = []; 

  try {
    // Fetch remaining data - including manual expenses
    const results = await Promise.allSettled([
      // Membership Role
      supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId) 
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
        .maybeSingle(),
      // Full Member List with Profiles
      supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select(`
          id,
          trip_id,
          user_id,
          role,
          joined_at,
          profiles!inner(
            id, 
            name, 
            avatar_url
          )
        `)
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId), 
      // Itinerary Items
      getItineraryItems(tripId, user.id), 
      // Splitwise Data
      getSplitwiseDataServer(tripId), 
      // Manual Expenses Fetch (Added)
      supabase
        .from('expenses') 
        .select('*') 
        .eq('trip_id', tripId)
        // Example filter: .is('source', null) or .neq('source', 'splitwise')
        .order('date', { ascending: false })
    ]);

    // Process results
    if (results[0].status === 'fulfilled') {
        membershipResult = results[0].value as { data: { role: string } | null; error: any };
    } else {
        console.error("Failed to fetch membership role:", results[0].reason);
    }
    if (results[1].status === 'fulfilled') {
        membersResult = results[1].value as { data: TripMemberFromSSR[] | null; error: any };
    } else {
        console.error("Failed to fetch members list:", results[1].reason);
    }
    if (results[2].status === 'fulfilled') {
        itineraryItemsResult = results[2].value as DisplayItineraryItem[];
    } else {
        console.error("Failed to fetch itinerary items:", results[2].reason);
    }
    if (results[3].status === 'fulfilled') {
         splitwiseDataResult = results[3].value as { expenses: SplitwiseExpense[]; groupName: string | null };
    } else {
         console.error("Failed to fetch splitwise data:", results[3].reason);
    }
    // Process manual expenses result (index 4)
    if (results[4].status === 'fulfilled') {
        // Use the locally defined ManualDbExpense type here
        const manualExpensesData = results[4].value as { data: ManualDbExpense[] | null; error: any };
        if (manualExpensesData.error) {
             console.error("Failed to fetch manual expenses:", manualExpensesData.error);
        } else {
             manualExpensesResult = manualExpensesData.data ?? [];
        }
    } else {
        console.error("Promise rejected when fetching manual expenses:", results[4].reason);
    }

  } catch (error) {
    console.error("Error fetching secondary page data:", error);
    // Decide how to handle failures here - maybe show partial data?
  }
  // --- End Step 2 ---

  // Calculations based on fetched data (trip is guaranteed non-null here if code reaches this point)
  const userRole = (membershipResult?.data?.role as TripRole) ?? null;
  const canEdit = userRole === TRIP_ROLES.ADMIN || userRole === TRIP_ROLES.EDITOR;
  const isTripOver = trip.end_date ? new Date(trip.end_date) < new Date() : false;

  return (
    <TripPageClient
      tripId={tripId} 
      tripName={trip.name}
      destinationId={destinationId} 
      initialMembers={membersResult?.data ?? []}
      initialItineraryItems={itineraryItemsResult}
      initialSplitwiseGroupId={trip.splitwise_group_id ?? null}
      initialSplitwiseExpenses={splitwiseDataResult.expenses}
      initialLinkedGroupName={splitwiseDataResult.groupName}
      // Pass manual expenses down
      initialManualExpenses={manualExpensesResult} 
      userRole={userRole}
      canEdit={canEdit}
      isTripOver={isTripOver}
    />
  );
}
