import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import ical from 'ical-generator';
import { TABLES } from '@/utils/constants/tables';
import { fromTable } from '@/utils/supabase/typed-client';
import { isItineraryItem, ItineraryItem } from '@/utils/type-guards';
import type { ItineraryItem as FullItineraryItem } from '@/types/itinerary';
import { exportTripCalendar } from '@/lib/api/trips';

// Define local field constants since they're not all available in central constants
const FIELDS = {
  COMMON: {
    ID: 'id',
  },
  TRIPS: {
    NAME: 'name',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
  },
  ITINERARY_ITEMS: {
    TRIP_ID: 'trip_id',
    DATE: 'date',
  },
};

// Type for export options
interface ExportOptions {
  exportOption: 'all' | 'selected';
  selectedDays?: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const supabase = await createRouteHandlerClient();
    const { exportOption, selectedDays }: ExportOptions = await request.json();
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Delegate to centralized API logic
    const result = await exportTripCalendar(tripId, {
      exportOption,
      selectedDays,
      asIcs: false,
      session,
    });
    if (!result.success) {
      // Special handling for Google auth errors
      if (result.error?.includes('Google')) {
        return NextResponse.json({ error: result.error, needsGoogleAuth: true }, { status: 400 });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: 'Calendar export successful',
      exportedItems: result.data?.exportedItems ?? 0,
      events: result.data?.events ?? [],
    });
  } catch (error) {
    console.error('Calendar export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- GET Handler --- //
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get basic trip information
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('id, name, description, start_date, end_date')
      .eq('id', tripId)
      .single();

    if (tripError) {
      console.error('Error fetching trip:', tripError);
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for days with itinerary items
    // Using direct string to avoid type errors
    const { data: daysWithItems, error: daysError } = await supabase
      .from('itinerary_items')
      .select('date')
      .eq('trip_id', tripId)
      .not('date', 'is', null);

    if (daysError) {
      console.error('Error fetching itinerary days:', daysError);
      return NextResponse.json({ error: 'Error fetching itinerary data' }, { status: 500 });
    }

    // Extract unique dates
    const uniqueDays = daysWithItems
      ? [...new Set(daysWithItems.map((item) => item.date).filter(Boolean))]
      : [];

    // Sort dates chronologically
    uniqueDays.sort((a, b) => {
      const dateA = typeof a === 'string' ? new Date(a) : new Date('');
      const dateB = typeof b === 'string' ? new Date(b) : new Date('');
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json({
      trip,
      availableDays: uniqueDays,
      itemCount: daysWithItems?.length || 0,
    });
  } catch (error) {
    console.error('Calendar export GET error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Creates a downloadable iCal file for the selected trip days
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const supabase = await createRouteHandlerClient();
    const { exportOption, selectedDays }: ExportOptions = await request.json();
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Delegate to centralized API logic
    const result = await exportTripCalendar(tripId, {
      exportOption,
      selectedDays,
      asIcs: true,
      session,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    // Return ICS file
    const icsString = result.data?.icsString ?? '';
    const tripName = result.data?.tripName ?? 'trip';
    return new NextResponse(icsString, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="${tripName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.ics"`,
      },
    });
  } catch (error) {
    console.error('iCal generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
