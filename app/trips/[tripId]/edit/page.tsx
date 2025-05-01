import { getServerComponentClient, getServerSession } from '@/utils/supabase/unified';
import { DB_TABLES, DB_FIELDS, TripRole } from '@/utils/constants/database';
import { PAGE_ROUTES } from '@/utils/constants/routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

// Import the client wrapper instead of using dynamic import with ssr: false
import EditTripFormWrapper from './edit-trip-form-wrapper';

export const metadata = {
  title: 'Edit Trip | WithMe Travel',
  description: 'Update your trip details and settings',
};

// Force dynamic rendering for this page since it uses auth
export const dynamicParams = true;

// Define a type specifically for the data structure returned by this page's query
interface FetchedTripData {
  id: string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  cover_image_url: string | null;
  // Use imported enum type or literal union type for privacy_setting
  privacy_setting: 'private' | 'shared_with_link' | 'public' | null;
  // Type for the joined destination data (since it's a single record)
  destinations: {
    id: string;
    name: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
  } | null;
  // Type for the joined tags data
  trip_tags: Array<{
    tags: {
      id: string;
      name: string;
    } | null;
  }> | null;
}

// Define the expected shape of the form data
interface TripFormData {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  tags: string[] | null;
}

// Define the expected shape of the page props
interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function EditTripPage({ params }: PageProps) {
  const { tripId } = await params;

  try {
    // Check if user is logged in using the getServerSession helper
    const session = await getServerSession();
    if (!session) {
      console.log('No session found for edit trip page, redirecting to login');
      redirect(`${PAGE_ROUTES.LOGIN}?redirectTo=${encodeURIComponent(`/trips/${tripId}/edit`)}`);
    }

    // Get the Supabase client to check permissions and get data
    const supabase = await getServerComponentClient();

    // Check if user has permission to edit this trip
    const { data: tripMember, error: tripMemberError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, session.user.id)
      .single();

    if (tripMemberError || !tripMember) {
      console.error('Error fetching trip member or user is not a member:', tripMemberError);
      notFound();
    }

    // Check if user has editor/organizer role
    if (![TripRole.EDITOR, TripRole.ADMIN].includes(tripMember.role)) {
      redirect(`/trips/${tripId}`);
    }

    // Fetch trip data with destination and tags
    const { data: trip, error: tripError } = (await supabase
      .from(DB_TABLES.TRIPS)
      .select(
        `
        id, name, start_date, end_date, destination_id, cover_image_url, privacy_setting,
        destinations:destination_id (
          id, name, address, city, country
        ),
        trip_tags (
          tags (
            id, name
          )
        )
      `
      )
      .eq(DB_FIELDS.COMMON.ID, tripId)
      .single()) as { data: FetchedTripData | null; error: any };

    if (tripError || !trip) {
      console.error('Error fetching trip:', tripError);
      return (
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load trip details. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Extract tag IDs from the trip_tags join table
    const tagIds = (trip.trip_tags || [])
      .filter((tt) => tt.tags !== null)
      .map((tt) => tt.tags?.id)
      .filter(Boolean) as string[];

    // Prepare the trip data for the form
    const formattedTrip = {
      id: trip.id,
      name: trip.name || 'Untitled Trip', // Provide a default name if null
      start_date: trip.start_date || '',
      end_date: trip.end_date || '',
      destination_id: trip.destination_id,
      cover_image_url: trip.cover_image_url,
      privacy_setting: trip.privacy_setting || 'private', // Provide a default privacy setting if null
      tags: tagIds,
    };

    return (
      <EditTripFormWrapper
        trip={formattedTrip}
        initialDestinationName={trip.destinations?.name || undefined}
        tripId={tripId}
      />
    );
  } catch (error) {
    console.error('Error in EditTripPage:', error);
    Sentry.captureException(error, {
      tags: { tripId, page: 'edit-trip' },
    });

    // Check if this is an auth error
    if (
      error instanceof Error &&
      (error.message.includes('auth') || error.message.includes('session'))
    ) {
      redirect(`${PAGE_ROUTES.LOGIN}?redirectTo=${encodeURIComponent(`/trips/${tripId}/edit`)}`);
    }

    // For other errors, show an error UI
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            An unexpected error occurred while loading the trip editor.
            {error instanceof Error ? ` ${error.message}` : ''}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
