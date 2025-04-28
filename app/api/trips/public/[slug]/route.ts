import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { calculateTravelTimes } from '@/lib/mapbox'
import { type TravelTimesResult } from "@/lib/mapbox"

// Define privacy setting type locally
type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

// --- Define expected structure for PublicTripData --- 
interface FetchedItineraryItem {
  id: number | string; // Allow string ID as well, just in case
  title: string | null;
  date: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  latitude: number | null;
  longitude: number | null;
  day_number?: number | null;
  estimated_cost?: number | string | null; // Allow string initially
  currency?: string | null;
  notes?: string | null;
  category?: string | null;
  item_type?: string | null;
}

// --- Add TripMember interface --- 
interface TripMember {
  id: string; // trip_member primary key
  user_id: string;
  role: string; // e.g., admin, editor, viewer
  profiles: {
    id: string; // profile primary key
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface FetchedTrip {
  id: string;
  name: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  // Replace created_by with members for more info
  // created_by: {
  //   id: string;
  //   name: string | null;
  //   avatar_url: string | null;
  // } | null;
  destination_id: string | null;
  destination_name: string | null;
  cover_image_url: string | null;
  status: string | null;
  itinerary_items: FetchedItineraryItem[] | null;
  trip_members: TripMember[] | null; // Add members here
  privacy_setting: TripPrivacySetting | null; // Add privacy setting
  playlist_url?: string | null;
}

interface PublicTripData {
  id: string;
  name: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  // Keep creator minimal or derive from members if needed
  creator: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  } | null; 
  members: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
  }[]; // Add formatted members list
  destinationId: string | null;
  destinationName: string | null;
  coverImageUrl: string | null;
  status: string | null;
  itineraryItems: {
    id: number | string; // Allow string ID
    title: string | null;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    day: number | null;
    cost: number | null;
    currency: string | null;
    notes: string | null;
    category: string | null;
    type: string | null;
  }[];
}

export async function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } }
) {

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter' },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient()

    // Fetch trip details with the given slug that is public or shared
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select(`
        id, name, description, start_date, end_date, 
        destination_name, cover_image_url, created_at,
        status, privacy_setting, playlist_url,
        trip_members(id, user_id, role, profiles(id, name, avatar_url))
      `)
      .eq('public_slug', slug)
      // Allow both public and shared_with_link
      .in('privacy_setting', ['public', 'shared_with_link'])
      .maybeSingle() // Use maybeSingle to allow 0 or 1 result without error

    if (tripError) {
      // Log the specific Supabase error
      console.error('Supabase error fetching public trip:', tripError);
      return NextResponse.json(
        { error: 'Database error fetching trip' },
        { status: 500 } 
      );
    }

    if (!trip) {
      console.log(`Public trip not found for slug: ${slug}`);
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch trip itinerary items - ensure lat/lng are selected
    const { data: items, error: itemsError } = await supabase
      .from('itinerary_items') 
      .select('id, title, date, start_time, end_time, location, latitude, longitude, day_number, estimated_cost, currency, notes, category, item_type') // Explicitly select needed fields including lat/lng
      .eq('trip_id', trip.id)
      .order('start_time', { ascending: true })

    if (itemsError) {
      console.error('Error fetching itinerary items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to fetch itinerary items' },
        { status: 500 }
      )
    }

    // Calculate travel times if items exist
    let travelTimes: Record<string, TravelTimesResult> = {};
    if (items && items.length > 1) {
      try {
        // Prepare items with the expected structure for the utility function
        const itemsForTravelCalc = items.map(item => ({
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude
        })); 
        travelTimes = await calculateTravelTimes(itemsForTravelCalc);
      } catch (travelError) {
        console.error("Error calculating travel times for public trip:", travelError);
        // Proceed without travel times, don't block the response
        travelTimes = {}; // Ensure it's an empty object on error
      }
    }

    return NextResponse.json({
      trip: {
        id: trip.id,
        name: trip.name,
        start_date: trip.start_date,
        end_date: trip.end_date,
        created_at: trip.created_at,
        cover_image_url: trip.cover_image_url,
        destination_name: trip.destination_name,
        description: trip.description,
        privacy_setting: trip.privacy_setting,
        playlist_url: trip.playlist_url,
        members: (trip.trip_members || []).map(m => {
          let profile: { id: string; name: string | null; avatar_url: string | null } | null = null;
          if (Array.isArray(m.profiles) && m.profiles.length > 0) {
            profile = m.profiles[0]; 
          } else if (m.profiles && typeof m.profiles === 'object' && !Array.isArray(m.profiles)) {
            profile = m.profiles as any;
          }
          
          return {
             id: m.user_id,
             name: profile ? profile.name : null,
             avatarUrl: profile ? profile.avatar_url : null,
             role: m.role
          };
        })
      },
      itinerary: (items || []).map(item => ({
        id: item.id,
        title: item.title,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        day: item.day_number,
        cost: typeof item.estimated_cost === 'string' ? parseFloat(item.estimated_cost) : item.estimated_cost,
        currency: item.currency,
        notes: item.notes,
        category: item.category,
        type: item.item_type
      })),
      travelTimes: travelTimes
    })
  } catch (error) {
    console.error('Unexpected error in public trip API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
